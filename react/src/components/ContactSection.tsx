import { motion } from 'framer-motion';
import { Phone, MapPin, Navigation } from 'lucide-react';
import { SEDES } from '../constants';

const WhatsAppIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ContactSection = () => {
  const sedes = [
    {
      name: SEDES.CENTRO.nombre,
      services: "Domicilio y punto físico",
      address: "Calle 17 # 3 - 45, Ibagué",
      mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.712163351221!2d-75.2346!3d4.4334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38c4fb6c37497d%3A0x6b779e43685c2c7d!2zQ2wuIDE3ICMzLTQ1LCBJYmFndcOpLCBUb2xpbWE!5e0!3m2!1ses!2sco!4v1713800000000!5m2!1ses!2sco",
      mapLink: "https://www.google.com/maps/search/?api=1&query=Rapifrios+Calle+17+%23+3+-+45+Ibague"
    },
    {
      name: "Sede 'La 16'",
      services: "Solo punto físico",
      address: "Calle 16 # 2 - 12, Ibagué",
      mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.712163351221!2d-75.2366!3d4.4354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38c4fb6c37497d%3A0x6b779e43685c2c7d!2zQ2wuIDE2ICMyLTEyLCBJYmFndcOpLCBUb2xpbWE!5e0!3m2!1ses!2sco!4v1713800000000!5m2!1ses!2sco",
      mapLink: "https://www.google.com/maps/search/?api=1&query=Rapifrios+Calle+16+%23+2+-+12+Ibague"
    },
    {
      name: SEDES.SALADO.nombre,
      services: "Domicilio y punto físico",
      address: "Carrera 14 # 145 - 20, El Salado",
      mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.712163351221!2d-75.1866!3d4.4854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38c4fb6c37497d%3A0x6b779e43685c2c7d!2zRWwgU2FsYWRvLCBJYmFndcOpLCBUb2xpbWE!5e0!3m2!1ses!2sco!4v1713800000000!5m2!1ses!2sco",
      mapLink: "https://www.google.com/maps/search/?api=1&query=Rapifrios+Carrera+14+%23+145+-+20+El+Salado+Ibague"
    }
  ];

  const contactNumbers = [
    { number: SEDES.CENTRO.tel, waNum: SEDES.CENTRO.wa, type: "Centro - Llamada + WhatsApp", wa: true },
    { number: SEDES.SALADO.tel, waNum: SEDES.SALADO.wa, type: "Salado - Llamada + WhatsApp", wa: true }
  ];

  return (
    <section id="contacto" className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-6 pt-32 pb-24 lg:pb-32 bg-surface-light">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto w-full text-center flex flex-col items-center justify-center"
      >
        <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-primary uppercase italic mb-6 md:mb-10 shrink-0">
          Contáctanos
        </h2>

        {/* Sedes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 md:mb-10 w-full">
          {sedes.map((sede, index) => (
            <motion.div
              key={sede.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.12 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-2xl hover:shadow-primary/10 transition-all flex flex-col justify-between min-h-[440px] max-h-full w-full group overflow-hidden"
            >
              <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 border border-primary/5 shrink-0">
                <iframe
                  title={sede.name}
                  src={sede.mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-700 w-full h-full"
                ></iframe>
              </div>
              <div className="flex-1 overflow-y-auto text-left pr-1 scrollbar-hide min-h-0">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2 mt-4 mb-5">
                  <MapPin size={18} className="text-primary-light" />
                  {sede.name}
                </h3>
                <p className="text-text-main font-semibold text-sm mb-2">
                  {sede.services}
                </p>
                <p className="text-text-main/70 text-xs mb-4">
                  {sede.address}
                </p>
              </div>
              <a 
                href={sede.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary text-white py-4 mt-auto rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-primary-light transition-colors active:scale-95 shrink-0"
              >
                <Navigation size={16} />
                CÓMO LLEGAR
              </a>
            </motion.div>
          ))}
        </div>

        {/* Contact Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 shadow-xl w-full max-w-4xl shrink-0 mt-12 mb-4"
        >
          <div className="flex flex-wrap justify-center gap-4 md:gap-10">
            {contactNumbers.map((contact) => (
              <div key={contact.number} className="flex flex-col items-center gap-2 min-w-[120px]">
                <div className="flex items-center gap-2 md:gap-3">
                  <a 
                    href={`tel:${contact.number}`}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full brand-gradient flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                  >
                    <Phone size={16} />
                  </a>
                  {contact.wa && (
                    <a 
                      href={`https://wa.me/${contact.waNum}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                    >
                      <WhatsAppIcon size={18} />
                    </a>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-primary font-black text-sm md:text-base tracking-tight">
                    {contact.number}
                  </p>
                  <p className="text-text-main/60 text-[8px] md:text-[9px] font-bold uppercase tracking-widest leading-none">
                    {contact.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
