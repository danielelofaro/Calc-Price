"use client";

import { useState, useMemo, Fragment, useEffect } from "react";
import { PlusCircle, MinusCircle, Euro, Percent, Plus, Moon, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type InputItem = {
  id: number;
  value: string;
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const initialItem = () => ({ id: Date.now(), value: "" });

  const [basePrices, setBasePrices] = useState<InputItem[]>([initialItem()]);
  const [discounts, setDiscounts] = useState<InputItem[]>([initialItem()]);
  const [markups, setMarkups] = useState<InputItem[]>([initialItem()]);
  
  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        setTheme(savedTheme);
        document.documentElement.className = savedTheme;
      }

      const savedBasePrices = localStorage.getItem('basePrices');
      setBasePrices(savedBasePrices ? JSON.parse(savedBasePrices) : [initialItem()]);
      
      const savedDiscounts = localStorage.getItem('discounts');
      setDiscounts(savedDiscounts ? JSON.parse(savedDiscounts) : [initialItem()]);

      const savedMarkups = localStorage.getItem('markups');
      setMarkups(savedMarkups ? JSON.parse(savedMarkups) : [initialItem()]);

    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    } finally {
      setIsMounted(true);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (isMounted) {
        localStorage.setItem('theme', theme);
        document.documentElement.className = theme;
    }
  }, [theme, isMounted]);

  useEffect(() => {
    if (isMounted) {
        localStorage.setItem('basePrices', JSON.stringify(basePrices));
    }
  }, [basePrices, isMounted]);

  useEffect(() => {
    if (isMounted) {
        localStorage.setItem('discounts', JSON.stringify(discounts));
    }
  }, [discounts, isMounted]);

  useEffect(() => {
    if (isMounted) {
        localStorage.setItem('markups', JSON.stringify(markups));
    }
  }, [markups, isMounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleReset = () => {
    const newId = Date.now();
    setBasePrices([initialItem()]);
    setDiscounts([initialItem()]);
    setMarkups([initialItem()]);
  };

  const handleAddItem = (
    setter: React.Dispatch<React.SetStateAction<InputItem[]>>
  ) => {
    setter((prev) => [...prev, initialItem()]);
  };

  const handleRemoveItem = (
    id: number,
    setter: React.Dispatch<React.SetStateAction<InputItem[]>>
  ) => {
    setter((prev) => {
      if (prev.length > 1) {
        return prev.filter((item) => item.id !== id);
      }
      return prev;
    });
  };

  const handleItemChange = (
    id: number,
    newValue: string,
    setter: React.Dispatch<React.SetStateAction<InputItem[]>>
  ) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value: newValue } : item))
    );
  };
  
  const renderInputGroup = (
    title: string,
    items: InputItem[],
    setter: React.Dispatch<React.SetStateAction<InputItem[]>>,
    placeholder: string,
    isPercentage: boolean = false
  ) => (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 p-4 pt-0">
        {items.map((item, index) => (
          <Fragment key={item.id}>
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      {isPercentage ? <Percent className="h-4 w-4 text-muted-foreground" /> : <Euro className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <Input
                  type="number"
                  placeholder={placeholder}
                  value={item.value}
                  onChange={(e) => handleItemChange(item.id, e.target.value, setter)}
                  className="pl-9 h-9"
                  aria-label={`${title} ${index + 1}`}
                  min="0"
                  step="0.01"
                  />
              </div>
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id, setter)}
                  className="text-muted-foreground hover:text-destructive shrink-0 h-9 w-9"
                  aria-label={`Rimuovi ${title} ${index + 1}`}
                >
                  <MinusCircle className="h-5 w-5" />
                </Button>
              )}
            </div>
            {title === "Prezzi di Listino" && items.length > 1 && index < items.length - 1 && (
              <div className="flex justify-center">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </Fragment>
        ))}
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button variant="outline" size="sm" className="w-full" onClick={() => handleAddItem(setter)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi campo
        </Button>
      </div>
    </Card>
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const calculatedValues = useMemo(() => {
    const totalBasePrice = basePrices.reduce(
      (sum, item) => sum + (parseFloat(item.value) || 0),
      0
    );

    const priceAfterDiscounts = discounts.reduce((price, item) => {
      const discountPercentage = parseFloat(item.value) || 0;
      if (discountPercentage > 0 && discountPercentage <= 100) {
        return price * (1 - discountPercentage / 100);
      }
      return price;
    }, totalBasePrice);

    const finalPrice = markups.reduce((price, item) => {
      const markupPercentage = parseFloat(item.value) || 0;
      if (markupPercentage >= 0) {
        return price * (1 + markupPercentage / 100);
      }
      return price;
    }, priceAfterDiscounts);
    
    const totalDiscountValue = totalBasePrice - priceAfterDiscounts;
    const totalMarkupValue = finalPrice - priceAfterDiscounts;
    
    const totalDiscountPercentage = totalBasePrice > 0 ? (totalDiscountValue / totalBasePrice) * 100 : 0;
    const totalMarkupPercentage = priceAfterDiscounts > 0 ? (totalMarkupValue / priceAfterDiscounts) * 100 : 0;

    return { totalBasePrice, finalPrice, totalDiscountValue, totalMarkupValue, totalDiscountPercentage, totalMarkupPercentage };
  }, [basePrices, discounts, markups]);

  if (!isMounted) {
      return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="py-4 text-center">
        <div className="container mx-auto flex justify-center items-center relative">
          <div className="flex-1 text-center">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-primary md:text-3xl">
              CalcoloPrezzi Pro
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Il tuo assistente per calcoli di prezzo rapidi ed eleganti.
            </p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleReset} aria-label="Reset fields">
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 pb-12">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {renderInputGroup("Prezzi di Listino", basePrices, setBasePrices, "Es. 100.00", false)}
            {renderInputGroup("Sconti %", discounts, setDiscounts, "Es. 10", true)}
            {renderInputGroup("Ricarichi %", markups, setMarkups, "Es. 20", true)}
        </div>
        
        <Card className="mt-6 overflow-hidden bg-primary text-primary-foreground shadow-2xl">
            <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold">Riepilogo</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-baseline">
                        <span className="text-primary-foreground/80">Prezzo base totale</span>
                        <span/>
                        <span className="font-semibold justify-self-end">{formatCurrency(calculatedValues.totalBasePrice)}</span>
                    </div>
                     <Separator className="bg-primary-foreground/20"/>
                     <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-baseline">
                        <span className="text-primary-foreground/80">Sconto applicato</span>
                        {calculatedValues.totalDiscountValue > 0 ? 
                            <span className="text-sm text-primary-foreground/70 justify-self-end">({calculatedValues.totalDiscountPercentage.toFixed(2)}%)</span>
                            : <span/>
                        }
                        <span className="font-semibold justify-self-end">- {formatCurrency(calculatedValues.totalDiscountValue)}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-baseline">
                        <span className="text-primary-foreground/80">Ricarico applicato</span>
                        {calculatedValues.totalMarkupValue > 0 ? 
                            <span className="text-sm text-primary-foreground/70 justify-self-end">({calculatedValues.totalMarkupPercentage.toFixed(2)}%)</span>
                            : <span/>
                        }
                        <span className="font-semibold justify-self-end">+ {formatCurrency(calculatedValues.totalMarkupValue)}</span>
                    </div>
                     <Separator className="bg-primary-foreground/20"/>
                    <div className="grid grid-cols-[1fr_auto_auto] items-center pt-1">
                        <span className="text-base font-bold">Prezzo Finale</span>
                        <span/>
                        <span className="text-2xl font-bold tracking-tight justify-self-end">{formatCurrency(calculatedValues.finalPrice)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
      </main>
        
      <footer className="py-4 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CalcoloPrezzi Pro. Realizzato con eleganza.</p>
      </footer>
    </div>
  );
}
