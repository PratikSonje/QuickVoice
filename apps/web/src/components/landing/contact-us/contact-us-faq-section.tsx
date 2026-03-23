"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Badge } from '@/components/ui/badge';

const faqs = [
  {
    question: "What types of voice agents can QuickVoice create for my business?",
    answer:
      "QuickVoice can create specialized voice agents for customer support, sales, appointment scheduling, lead qualification, order processing, and more. Our AI agents are trained on your specific business data and can handle complex conversations while maintaining your brand voice and tone.",
  },
  {
    question: "How quickly can I deploy a voice agent for my business?",
    answer:
      "Most voice agents can be deployed within 1-2 weeks. The timeline depends on complexity, integrations needed, and data preparation. Our team works closely with you to ensure a smooth deployment process with comprehensive testing and training.",
  },
  {
    question: "Can voice agents integrate with my existing CRM and business systems?",
    answer:
      "Yes, QuickVoice offers native integrations with over 200+ popular business tools including Salesforce, HubSpot, Zendesk, Microsoft Dynamics, and custom APIs. Our integration specialists ensure seamless data flow between your voice agents and existing systems.",
  },
  {
    question: "What languages and accents do your voice agents support?",
    answer:
      "Our voice agents support 50+ languages with natural accents and regional variations. We offer multilingual support for global businesses, including English, Spanish, French, German, Italian, Japanese, Korean, Arabic, Hindi, and many more with authentic local accents.",
  },
  {
    question: "How do you ensure voice agent quality and accuracy?",
    answer:
      "We use advanced AI training with your specific business data, continuous learning algorithms, and comprehensive testing. Our quality assurance includes A/B testing, performance monitoring, and regular updates to ensure your voice agents deliver accurate, helpful responses that improve over time.",
  },
  {
    question: "What security and compliance measures are in place?",
    answer:
      "QuickVoice is SOC 2 Type II certified and compliant with HIPAA, PCI DSS, and GDPR. We use enterprise-grade encryption, secure data centers, and comprehensive audit trails. All voice interactions are encrypted and stored securely with complete privacy protection.",
  },
  {
    question: "How quickly can I get started with QuickVoice?",
    answer:
      "You can get started with QuickVoice in just a few minutes. Our no-code platform allows you to create and deploy voice agents without any technical expertise. Most businesses see results within the first week.",
  },
  {
    question: "What industries do you serve?",
    answer:
      "We serve businesses across all industries including healthcare, financial services, retail, real estate, automotive, travel, education, and more. Our voice agents are customizable for any business need.",
  },
  {
    question: "Do I need technical knowledge to use QuickVoice?",
    answer:
      "No technical knowledge required! QuickVoice is designed as a no-code platform, making it easy for anyone to create and manage voice agents. Our intuitive interface guides you through the entire process.",
  },
  {
    question: "What support do you provide?",
    answer:
      "We provide comprehensive support including setup assistance, training, and ongoing technical support. Our team is available via phone, email, and chat to help you succeed with your voice automation goals.",
  },
];

export function ContactUsFaqSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <section className="py-16 bg-background transition-colors">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center">
          <Badge
            variant="outline"
            className="border-primary text-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase dark:border-primary"
          >
            FAQs
          </Badge>

          <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
            Frequently Asked Questions
          </h2>

          <p className="text-muted-foreground max-w-2xl text-center">
            Get answers to common questions about QuickVoice and our voice AI solutions.
          </p>
        </div>

        {/* FAQ List */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AnimatePresence>
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`border-border h-fit overflow-hidden rounded-xl border transition-all duration-300 ${
                    isOpen
                      ? 'shadow-3xl bg-card/50 border-primary/30'
                      : 'bg-card/50 hover:border-primary/20'
                  }`}
                  style={{ minHeight: "88px" }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors duration-300 hover:bg-card/70"
                  >
                    <h3 className="text-foreground text-lg font-medium">
                      {faq.question}
                    </h3>

                    <div className="ml-4 flex-shrink-0">
                      {isOpen ? (
                        <MinusIcon className="text-primary h-5 w-5" />
                      ) : (
                        <PlusIcon className="text-primary h-5 w-5" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-6 pt-2 pb-6">
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
