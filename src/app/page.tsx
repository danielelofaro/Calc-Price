"use client";

import { useState, useMemo } from "react";
import { PlusCircle, MinusCircle, Euro, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type InputItem = {
  id: number;
  value: string;
};

export default function Home() {
  const [basePrices, setBasePrices] = useState<InputItem[]>([
    { id: Date.now(), value: "" },
  ]);
  const [discounts, setDiscounts] = useState<InputItem[]>([
    { id: Date.now(), value: "" },
  ]);
  const [markups, setMarkups] = useState<InputItem[]>([
    { id: Date.now(), value: "" },
  ]);

  const handleAddItem = (
    setter: React.Dispatch<React.SetStateAction<InputItem[]>>
  ) => {
    setter((prev) => {
      if (prev.length < 3) {
        return [...prev, { id: Date.now(), value: "" }];
      }
      return prev;
    });
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
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    {isPercentage ? <Percent className="h-4 w-4 text-muted-foreground" /> : <Euro className="h-4 w-4 text-muted-foreground" />}
                </div>
                <Input
                type="number"
                placeholder={placeholder}
                value={item.value}
                onChange={(e) => handleItemChange(item.id, e.target.value, setter)}
                className="pl-9"
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
                className="text-muted-foreground hover:text-destructive shrink-0"
                aria-label={`Rimuovi ${title} ${index + 1}`}
              >
                <MinusCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
      <div className="p-6 pt-0">
      {items.length < 3 ? (
        <Button variant="outline" className="w-full" onClick={() => handleAddItem(setter)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi campo
        </Button>
      ) : <div className="h-10"/> }
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

    return { totalBasePrice, finalPrice, totalDiscountValue, totalMarkupValue };
  }, [basePrices, discounts, markups]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
          CalcoloPrezzi Pro
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Il tuo assistente per calcoli di prezzo rapidi ed eleganti.
        </p>
      </header>

      <main className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {renderInputGroup("Prezzi di Listino", basePrices, setBasePrices, "Es. 100.00", false)}
            {renderInputGroup("Sconti %", discounts, setDiscounts, "Es. 10", true)}
            {renderInputGroup("Ricarichi %", markups, setMarkups, "Es. 20", true)}
        </div>
        
        <Card className="mt-8 overflow-hidden bg-primary text-primary-foreground shadow-2xl">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">Riepilogo</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 text-lg">
                    <div className="flex justify-between items-baseline">
                        <span className="text-primary-foreground/80">Prezzo base totale</span>
                        <span className="font-semibold">{formatCurrency(calculatedValues.totalBasePrice)}</span>
                    </div>
                     <Separator className="my-2 bg-primary-foreground/20"/>
                    <div className="flex justify-between items-baseline">
                        <span className="text-primary-foreground/80">Sconto applicato</span>
                        <span className="font-semibold">- {formatCurrency(calculatedValues.totalDiscountValue)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-primary-foreground/80">Ricarico applicato</span>
                        <span className="font-semibold">+ {formatCurrency(calculatedValues.totalMarkupValue)}</span>
                    </div>
                     <Separator className="my-4 bg-primary-foreground/20"/>
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-2xl font-bold">Prezzo Finale</span>
                        <span className="text-4xl font-bold tracking-tight">{formatCurrency(calculatedValues.finalPrice)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
      </main>
        
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CalcoloPrezzi Pro. Realizzato con eleganza.</p>
      </footer>
    </div>
  );
}
