'use client';

import { motion } from 'framer-motion';
import { Award, Users, TrendingUp } from 'lucide-react';

export function AboutUsRecognitionSection() {
  return (
    <section className="relative py-20 bg-background">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-2xl sm:text-center mb-16"
        >
          <div className="relative z-10">
            <h2 className="font-geist text-3xl font-normal tracking-tight text-foreground sm:text-4xl md:text-5xl mb-4">
              Recognition &amp; Partnerships
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              QuickVoice has been recognized by industry leaders and has established strategic partnerships that drive
              innovation in AI voice automation.
            </p>
          </div>
          <div
            className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
            style={{
              background:
                "linear-gradient(152.92deg, rgba(var(--primary-rgb), 0.6) 4.54%, rgba(var(--primary-rgb), 0.35) 34.2%, rgba(var(--primary-rgb), 0.95) 77.55%)",
            }}></div>
        </motion.div>
        <hr className="bg-foreground/30 mx-auto mb-12 h-px w-1/2" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="group relative transform-gpu space-y-4 rounded-xl border border-border bg-transparent p-8 transition-all duration-200 ease-out hover:border-primary/30 [box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.18)_inset] hover:[box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.25)_inset]"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none"></div>
            <div className="relative z-10 text-center">
              <div className="text-primary w-fit mx-auto transform-gpu rounded-full border p-4 mb-6 transition-all duration-200 ease-out group-hover:scale-110 group-hover:bg-primary/10 [box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.25)_inset] dark:[box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.06)_inset]">
                <Award className="h-6 w-6 text-primary transition-transform duration-200 ease-out group-hover:scale-110" />
              </div>
              <h3 className="font-geist text-xl font-bold tracking-tighter text-foreground mb-4">Industry Recognition</h3>
              <p className="text-muted-foreground text-sm leading-relaxed transition-colors duration-200 ease-out group-hover:text-foreground/80">
                Backed by Microsoft for Startups and Nvidia Inception. Built on enterprise-grade infrastructure with Twilio and Telnyx partnerships.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="group relative transform-gpu space-y-4 rounded-xl border border-border bg-transparent p-8 transition-all duration-200 ease-out hover:border-primary/30 [box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.18)_inset] hover:[box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.25)_inset]"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none"></div>
            <div className="relative z-10 text-center">
              <div className="text-primary w-fit mx-auto transform-gpu rounded-full border p-4 mb-6 transition-all duration-200 ease-out group-hover:scale-110 group-hover:bg-primary/10 [box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.25)_inset] dark:[box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.06)_inset]">
                <Users className="h-6 w-6 text-primary transition-transform duration-200 ease-out group-hover:scale-110" />
              </div>
              <h3 className="font-geist text-xl font-bold tracking-tighter text-foreground mb-4">Strategic Partnerships</h3>
              <p className="text-muted-foreground text-sm leading-relaxed transition-colors duration-200 ease-out group-hover:text-foreground/80">
                Technology partnerships with Deepgram (STT), ElevenLabs (TTS), Twilio, and Telnyx for enterprise-grade telephony.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="group relative transform-gpu space-y-4 rounded-xl border border-border bg-transparent p-8 transition-all duration-200 ease-out hover:border-primary/30 [box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.18)_inset] hover:[box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.25)_inset]"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none"></div>
            <div className="relative z-10 text-center">
              <div className="text-primary w-fit mx-auto transform-gpu rounded-full border p-4 mb-6 transition-all duration-200 ease-out group-hover:scale-110 group-hover:bg-primary/10 [box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.25)_inset] dark:[box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.06)_inset]">
                <TrendingUp className="h-6 w-6 text-primary transition-transform duration-200 ease-out group-hover:scale-110" />
              </div>
              <h3 className="font-geist text-xl font-bold tracking-tighter text-foreground mb-4">Market Leadership</h3>
              <p className="text-muted-foreground text-sm leading-relaxed transition-colors duration-200 ease-out group-hover:text-foreground/80">
                No-code AI voice agent deployment in under 2 minutes, with HIPAA, SOC 2, and ISO 27001 compliance for regulated industries.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: '100+', label: 'Languages Supported', description: 'Global voice AI coverage' },
            { value: '11', label: 'Industries Served', description: 'Healthcare, automotive, SaaS, and more' },
            { value: '99.9%', label: 'Uptime Guarantee', description: 'Reliable service you can count on' },
            { value: '24/7', label: 'Support Available', description: 'Round-the-clock assistance for you' }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <div className="text-3xl font-semibold text-primary mb-2 transition-colors duration-200 ease-out group-hover:text-primary/80">{item.value}</div>
              <h4 className="font-semibold text-foreground mb-2 transition-colors duration-200 ease-out group-hover:text-primary">{item.label}</h4>
              <p className="text-sm text-muted-foreground transition-colors duration-200 ease-out group-hover:text-foreground/80">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
