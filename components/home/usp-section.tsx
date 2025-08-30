'use client';

import { motion } from 'framer-motion';
import { Ruler, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    step: '01',
    title: 'Share Your Measurements',
    description: 'Simply provide your measurements or let our sizing guide help you find the perfect fit.'
  },
  {
    step: '02', 
    title: 'We Create Your Size',
    description: 'Our designers craft each piece specifically to your measurements for the perfect fit.'
  },
  {
    step: '03',
    title: 'Delivered to You',
    description: 'Receive your custom-sized designer clothing that fits like it was made just for you.'
  }
];

export function USPSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Main USP */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Ruler className="h-4 w-4" />
            Custom Sizing
          </div>
          
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-black">
            Every Piece Made
            <br />
            <span className="italic">For Your Body</span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop settling for standard sizes. Get designer clothing tailored to your exact measurements.
          </p>

          <div className="bg-neutral-50 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 mx-auto">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-neutral-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button size="lg" className="bg-black hover:bg-neutral-800 text-white px-8 py-4 text-lg">
            Start Custom Sizing
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}