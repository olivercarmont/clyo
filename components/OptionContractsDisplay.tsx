"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StockSearch from "@/components/StockSearch";
import FAQCard from "@/components/FAQ";

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

export const OptionContractsDisplay: React.FC = () => {
  const [callOptions, setCallOptions] = useState<OptionContract[]>([]);
  const [putOptions, setPutOptions] = useState<OptionContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStock, setCurrentStock] = useState<{ symbol: string, name: string }>({ symbol: 'AAPL', name: 'Apple Inc.' });

  useEffect(() => {
    // Fetch initial options for AAPL when the component mounts
    handleStockSelect({ symbol: 'AAPL', name: 'Apple Inc.' });
  }, []);

  const handleStockSelect = async (obj: { symbol: string, name: string }) => {
    setCurrentStock(obj);
    setLoading(true);
    setError(null);
    try {
      const callContracts = await fetchOptionContracts(obj.symbol, 'call');
      const putContracts = await fetchOptionContracts(obj.symbol, 'put');
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
    <div className="flex gap-8 px-4 max-w-[2000px] mx-auto w-full">
      <div className="flex-grow">
        <Card className='w-full border-[1px] pr-4'>
          <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-6'>
            <CardTitle className="text-3xl mb-4 font-sans text-white">Clyo: Option Contracts UI</CardTitle>
            <CardDescription className="mt-2 font-sans text-gray-400">
              API URL: <a href="https://wg2rfvqgbqsxc6ucdfnqldlzoa0buncf.lambda-url.us-east-1.on.aws/" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">https://wg2rfvqgbqsxc6ucdfnqldlzoa0buncf.lambda-url.us-east-1.on.aws/</a>
            </CardDescription>
            <CardDescription className="mt-2 font-sans text-gray-400">
              GitHub Repository: <a href="https://github.com/olivercarmont/option-contracts-api" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">https://github.com/olivercarmont/option-contracts-api</a>
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-7 pl-4'>
            <CardDescription className="mb-2 ml-2 text-lg font-sans text-white font-bold">Select a stock:</CardDescription>
            <div className="flex items-center space-x-2 mb-4 w-full max-w-2xl">
              <StockSearch 
                onSelectStock={handleStockSelect}
                inputClassName="h-12 mb-2 text-base tracking-tight transition-all duration-100 ease-in-out focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0 focus-visible:outline-none font-sans"
                initialValue=""
              />
            </div>
            {error && <div className="text-red-500 mb-6 font-sans">{error}</div>}
            <div className='pl-4'>
              {loading ? (
                <LoadingScreen />
              ) : (
                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-6 font-sans text-white">Call Options for {currentStock.symbol}</h3>
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
                    <h3 className="text-2xl font-semibold mb-6 font-sans text-white">Put Options for {currentStock.symbol}</h3>
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
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="w-3/8">
        <FAQCard />
      </div>
    </div>
  );
};