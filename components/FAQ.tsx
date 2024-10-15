import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What is Implied Volatility?",
    answer: "Implied volatility is a metric that captures the market's view of the likelihood of changes in a given security's price. Higher implied volatility indicates that the market is expecting larger price swings, while lower implied volatility suggests smaller price movements are anticipated."
  },
  {
    question: "What is Delta?",
    answer: "Delta measures the rate of change in the price of an option with respect to the change in the underlying asset's price. A delta of 0.5 means that for every $1 the underlying stock moves, the option price is expected to change by $0.50."
  },
  {
    question: "What is Gamma?",
    answer: "Gamma measures the rate of change in an option's delta per 1-point move in the underlying asset's price. It provides information about how stable an option's delta is: higher gamma values mean that delta could change more quickly with changes in the underlying price."
  },
  {
    question: "What is Theta?",
    answer: "Theta represents the rate of change in the price of an option with respect to the passage of time, also known as time decay. It is typically a negative value for bought options, indicating that the option loses value as time passes."
  },
  {
    question: "What is Vega?",
    answer: "Vega measures the rate of change in an option's price with respect to the change in the underlying asset's implied volatility. A higher vega indicates the option's value is more sensitive to changes in volatility."
  },
];

const FAQCard: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Card className='w-full max-w-[400px] mt-8'>
      <CardHeader>
        <CardTitle className="text-2xl font-sans">FAQ</CardTitle>
      </CardHeader>
      <CardContent>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4">
            <button
              className="flex justify-between items-center w-full text-left font-semibold text-lg py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              onClick={() => toggleQuestion(index)}
            >
              {item.question}
              <span>{openIndex === index ? '▲' : '▼'}</span>
            </button>
            {openIndex === index && (
              <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-md">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FAQCard;