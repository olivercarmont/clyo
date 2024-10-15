"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StockSearch from "@/components/StockSearch";

interface OptionContract {
  contract_type: string;
  expiration_date: string;
  implied_volatility: string;
  open_interest: string;
  strike_price: string;
  ticker: string;
  last_quote: {
    underlying_price: number;
  };
  day_change: string;
  day_change_percent: string;
  day_volume: string;
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
}

interface ApiResponse {
  option_contracts: OptionContract[];
}

interface ApiResponseWrapper {
  req_id: string;
  response: string;
}

interface StockPriceData {
  c: number;
}

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
  {
    question: "What is Open Interest?",
    answer: "Open interest represents the total number of outstanding options contracts that have not been settled for a particular strike price and expiration date. It indicates the liquidity of an option and the level of activity for that specific contract."
  },
  {
    question: "What is Day Volume?",
    answer: "Day volume refers to the total number of option contracts traded during the current trading day for a specific strike price and expiration date. It provides insight into the current trading activity and liquidity of an option contract."
  }
];

export const OptionContractsDisplay: React.FC = () => {
  const [callOptions, setCallOptions] = useState<OptionContract[]>([]);
  const [putOptions, setPutOptions] = useState<OptionContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStockSelect = async (obj: string) => {
    let ticker = obj["symbol"];
    let name = obj["symbol"];
    setLoading(true);
    setError(null);
    try {
      const callContracts = await fetchOptionContracts(ticker, 'call');
      const putContracts = await fetchOptionContracts(ticker, 'put');
      setCallOptions(callContracts);
      setPutOptions(putContracts);
    } catch (err) {
      setError('Failed to fetch option contracts. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptionContracts = async (ticker: string, contractType: 'call' | 'put') => {
    console.log(ticker);
    const params = new URLSearchParams({
      ticker_symbol: ticker,
      limit: "20",
      days_forward: "14",
      contract_type: contractType
    });

    const response = await fetch(`/api/option-contracts?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch option contracts');
    }

    const data: ApiResponseWrapper = await response.json();
    const parsedData: ApiResponse = JSON.parse(data.response);
    return parsedData.option_contracts;
  };

  const LoadingScreen: React.FC = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  const FAQCard: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleQuestion = (index: number) => {
      setOpenIndex(openIndex === index ? null : index);
    };

    return (
      <Card className='w-full mt-8'>
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

  const OptionCard = ({ contract, isCall }: { contract: OptionContract, isCall: boolean }) => {
    const strikePrice = parseFloat(contract.strike_price);
    const currentPrice = contract.last_quote.underlying_price;
    const priceDifferencePercentage = ((strikePrice - currentPrice) / currentPrice) * 100;

    const bgColor = isCall
      ? 'bg-sky-200 dark:bg-sky-800'
      : 'bg-orange-200 dark:bg-orange-800';

    const priceDescription = strikePrice > currentPrice ? "above current price" : "below current price";

    // Format the expiration date
    const expirationDate = new Date(contract.expiration_date);
    const formattedExpiration = expirationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <Card className={`p-6 ${bgColor} w-full`}>
        <div className="mb-4">
          <CardTitle className="text-4xl mb-1 text-gray-800 dark:text-gray-100 font-sans">${strikePrice.toFixed(2)}</CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 font-sans font-bold">
              {priceDifferencePercentage > 0 ? '+' : ''}{priceDifferencePercentage.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300 font-sans italic">
              {priceDescription}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-200 font-sans mb-4">
          <p>Implied Volatility:</p>
          <p className="text-right">{contract.implied_volatility}</p>
          
          <p>Open Interest:</p>
          <p className="text-right">{contract.open_interest}</p>
          
          <p>Day Change:</p>
          <p className="text-right">{contract.day_change} ({contract.day_change_percent})</p>
          
          <p>Day Volume:</p>
          <p className="text-right">{contract.day_volume}</p>
        </div>
        <div className="border-t border-white pt-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold text-center">Delta</p>
              <p className="text-sm text-center">{contract.greeks?.delta.toFixed(4)}</p>
            </div>
            <div>
              <p className="font-semibold text-center">Gamma</p>
              <p className="text-sm text-center">{contract.greeks?.gamma.toFixed(4)}</p>
            </div>
            <div>
              <p className="font-semibold text-center">Theta</p>
              <p className="text-sm text-center">{contract.greeks?.theta.toFixed(4)}</p>
            </div>
            <div>
              <p className="font-semibold text-center">Vega</p>
              <p className="text-sm text-center">{contract.greeks?.vega.toFixed(4)}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{formattedExpiration}</p>
          <p className="text-sm text-gray-500 dark:text-gray-300 font-sans italic">
              contract expires
            </p>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-8 px-4 max-w-[2000px] mx-auto w-full">
      <Card className='w-full mt-8'>
        <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-6'>
          <CardTitle className="text-3xl mb-4 font-sans">Stock Option Contracts Viewer</CardTitle>
          <CardDescription className="font-sans">
            UI for the rust api for fetching stock option data:
          </CardDescription>
          <CardDescription className="mt-2 font-sans">
            GitHub Repository: <a href="https://github.com/olivercarmont/option-contracts-api" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://github.com/olivercarmont/option-contracts-api</a>
          </CardDescription>
        </CardHeader>
        <CardContent className='p-8'>
          <CardDescription className="mb-4 text-sm font-sans">Select a stock</CardDescription>
          <div className="flex items-center space-x-2 mb-8 w-full max-w-2xl">
            <StockSearch 
              onSelectStock={handleStockSelect}
              inputClassName="h-12 text-base tracking-tight transition-all duration-100 ease-in-out focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0 focus-visible:outline-none font-sans"
            />
          </div>
          {error && <div className="text-red-500 mb-6 font-sans">{error}</div>}
          {loading ? (
            <LoadingScreen />
          ) : (
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-6 font-sans">Call Options</h3>
                <div className="grid grid-cols-1 gap-6">
                  {callOptions.length > 0 ? (
                    callOptions.map((contract, index) => (
                      <OptionCard key={`call-${index}`} contract={contract} isCall={true} />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 col-span-full font-sans">No call options available for this stock.</div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-6 font-sans">Put Options</h3>
                <div className="grid grid-cols-1 gap-6">
                  {putOptions.length > 0 ? (
                    putOptions.map((contract, index) => (
                      <OptionCard key={`put-${index}`} contract={contract} isCall={false} />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 col-span-full font-sans">No put options available for this stock.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <FAQCard />
    </div>
  );
};