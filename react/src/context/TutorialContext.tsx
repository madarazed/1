import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface TutorialContextType {
  tutorialStep: number;
  isActive: boolean;
  isStep2Dismissed: boolean;
  isStep3Dismissed: boolean;
  nextStep: () => void;
  closeTutorial: () => void;
  setStep: (step: number) => void;
  dismissStep2: () => void;
  dismissStep3: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isStep2Dismissed, setIsStep2Dismissed] = useState<boolean>(false);
  const [isStep3Dismissed, setIsStep3Dismissed] = useState<boolean>(false);

  useEffect(() => {
    const sessionChecked = sessionStorage.getItem('rapifrios_tutorial_session_active');
    if (!sessionChecked) {
      // Guarda en memoria de inmediato para evitar dobles ejecuciones
      sessionStorage.setItem('rapifrios_tutorial_session_active', 'true');
      
      // Espera a que la página termine de animarse antes de lanzar el Paso 1
      setTimeout(() => {
        setTutorialStep(1);
        setIsActive(true);
      }, 800); // 800ms suele ser suficiente para animaciones de carga estándar
    }
  }, []);

  const nextStep = useCallback(() => {
    setTutorialStep((prev) => {
      const next = prev + 1;
      if (next > 3) {
        sessionStorage.setItem('rapifrios_tutorial_done', 'true');
        setIsActive(false);
        return 0;
      }
      return next;
    });
  }, []);

  const closeTutorial = useCallback(() => {
    sessionStorage.setItem('rapifrios_tutorial_done', 'true');
    setTutorialStep(0);
    setIsActive(false);
  }, []);

  const setStep = useCallback((step: number) => {
    if (step === 0) {
      setIsActive(false);
    } else {
      setIsActive(true);
    }
    if (step === 1) {
      setIsStep2Dismissed(false);
      setIsStep3Dismissed(false);
    }
    setTutorialStep(step);
  }, []);

  const dismissStep2 = useCallback(() => {
    setIsStep2Dismissed(true);
    setTutorialStep(1.5); // Usa directamente el setter base de React para evitar loops
  }, []);

  const dismissStep3 = useCallback(() => {
    setIsStep3Dismissed(true);
    setTutorialStep(1.5); // Usa directamente el setter base de React para evitar loops
  }, []);

  const contextValue = useMemo(() => ({
    tutorialStep,
    isActive,
    isStep2Dismissed,
    isStep3Dismissed,
    nextStep,
    closeTutorial,
    setStep,
    dismissStep2,
    dismissStep3
  }), [
    tutorialStep,
    isActive,
    isStep2Dismissed,
    isStep3Dismissed,
    nextStep,
    closeTutorial,
    setStep,
    dismissStep2,
    dismissStep3
  ]);

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
