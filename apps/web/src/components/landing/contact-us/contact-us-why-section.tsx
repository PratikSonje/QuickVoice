"use client";

import { motion } from "framer-motion";
import { Rocket, DollarSign, Target, Wrench, Shield, Globe } from "lucide-react";

const whyItems = [
  {
    icon: Rocket,
    title: "Rapid Deployment",
    desc: "Get your voice agents up and running in minutes, not months. Our no-code platform makes it incredibly easy to deploy AI solutions.",
  },
  {
    icon: DollarSign,
    title: "Cost Savings",
    desc: "Reduce operational costs by up to 70% while improving customer satisfaction. Our voice agents work 24/7 without breaks or sick days.",
  },
  {
    icon: Target,
    title: "Proven Results",
    desc: "Join 10,000+ businesses that have increased sales by 40% and improved customer satisfaction by 85% with our voice AI solutions.",
  },
  {
    icon: Wrench,
    title: "Easy Integration",
    desc: "Seamlessly integrate with your existing CRM, helpdesk, and business tools. No complex technical setup required.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "Bank-level security with SOC 2 Type II certification, HIPAA compliance, and end-to-end encryption for all conversations.",
  },
  {
    icon: Globe,
    title: "Global Support",
    desc: "Multilingual support in 50+ languages with 24/7 availability. Serve customers worldwide with authentic local accents.",
  },
];

export function ContactUsWhySection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mx-auto max-w-2xl"
          >
            <div
              className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
              style={{
                background:
                  "linear-gradient(152.92deg, rgba(var(--primary-rgb), 0.6) 4.54%, rgba(var(--primary-rgb), 0.35) 34.2%, rgba(var(--primary-rgb), 0.95) 77.55%)",
              }}
            />
            <h2 className="relative z-10 font-geist text-3xl font-light tracking-tighter text-foreground sm:text-4xl lg:text-5xl mb-6">
              Why Contact QuickVoice?
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg leading-8 text-muted-foreground max-w-3xl mx-auto"
          >
            Discover how our award-winning voice AI platform can transform your business operations and customer experience.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {whyItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                default: { duration: 0.6, delay: index * 0.1, ease: "easeOut" },
                y: { duration: 0.2, ease: "easeOut" }
              }}
              whileHover={{ y: -4 }}
              className="group relative transform-gpu space-y-3 rounded-xl border border-border bg-transparent p-6 transition-all duration-200 ease-out hover:border-primary/30 [box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.18)_inset] hover:[box-shadow:0_-20px_80px_-20px_rgba(var(--primary-rgb),0.25)_inset]"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none"></div>

              <div className="relative z-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all duration-200 ease-out group-hover:bg-primary/20 mx-auto">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 transition-colors duration-200 ease-out group-hover:text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground transition-colors duration-200 ease-out group-hover:text-foreground/80">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
