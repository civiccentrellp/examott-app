"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export default function AccessPricingTab({
  data,
  onChange,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
}) {
  const [multiplePlans, setMultiplePlans] = useState<any[]>([]);
  const [promotedIndex, setPromotedIndex] = useState<number | null>(null);
  const [showInstallments, setShowInstallments] = useState(false);

  // Installments Preview
  const [totalInstallments, setTotalInstallments] = useState(3);
  const [installmentPeriod, setInstallmentPeriod] = useState("Monthly");
  const [installmentPreview, setInstallmentPreview] = useState<any[]>([]);

  // ---------- helpers ----------
  const toNumber = (v: any) => (Number.isFinite(+v) ? +v : 0);
  const calcEP = (price: any, discount: any) =>
    Math.max(toNumber(price) - toNumber(discount), 0);

  const convertToDays = (duration: number, unit: string) => {
    if (!duration && duration !== 0) return null;
    if (unit === "day") return duration;
    if (unit === "month") return duration * 30;
    if (unit === "year") return duration * 365;
    return duration;
  };

  const didInitMultiple = useRef(false);
  const lastPushedHash = useRef<string | null>(null);

  const hashPlans = (plans: any[]) =>
    JSON.stringify(
      plans.map((p) => ({
        price: toNumber(p.price),
        discount: toNumber(p.discount),
        durationInDays:
          p.durationInDays ??
          convertToDays(parseInt(p.duration, 10), p.unit),
        promoted: !!p.promoted,
      }))
    );

  // ---------- Prefill when entering MULTIPLE (once) ----------
  useEffect(() => {
    if (data.accessType !== "MULTIPLE") {
      // reset init flag when leaving MULTIPLE
      didInitMultiple.current = false;
      return;
    }

    if (
      !didInitMultiple.current &&
      Array.isArray(data.pricingOptions) &&
      data.pricingOptions.length
    ) {
      const plans = data.pricingOptions.map((p: any) => {
        const days = p.durationInDays ?? 0;
        let durationValue = String(days);
        let unitValue = "day";

        if (days >= 365 && days % 365 === 0) {
          durationValue = String(days / 365);
          unitValue = "year";
        } else if (days >= 30 && days % 30 === 0) {
          durationValue = String(days / 30);
          unitValue = "month";
        }

        return {
          duration: durationValue,
          unit: unitValue,
          price: p.price?.toString() || "",
          discount: p.discount?.toString() || "",
        };
      });

      setMultiplePlans(plans);
      const promotedIdx = data.pricingOptions.findIndex(
        (p: any) => p.promoted
      );
      if (promotedIdx >= 0) setPromotedIndex(promotedIdx);
      didInitMultiple.current = true;

      // Remember what we mirrored so we don't push it back immediately
      lastPushedHash.current = hashPlans(data.pricingOptions);
    }
  }, [data.accessType, data.pricingOptions]);

  // ---------- Push up changes for MULTIPLE (only if changed) ----------
  useEffect(() => {
    if (data.accessType !== "MULTIPLE") return;

    const processedPlans = multiplePlans.map((p, idx) => {
      const d = parseInt(p.duration, 10);
      const durationInDays = Number.isFinite(d)
        ? convertToDays(d, p.unit)
        : null;

      return {
        price: toNumber(p.price),
        discount: toNumber(p.discount),
        effectivePrice: calcEP(p.price, p.discount),
        durationInDays,
        promoted: idx === promotedIndex,
      };
    });

    const currentHash = hashPlans(processedPlans);
    if (currentHash !== lastPushedHash.current) {
      onChange("pricingOptions", processedPlans);
      lastPushedHash.current = currentHash;
    }
  }, [data.accessType, multiplePlans, promotedIndex]);

  // ---------- Push up single/expiry/lifetime option ----------
  useEffect(() => {
    if (data.accessType === "MULTIPLE") return;

    const singleOption = {
      price: toNumber(data.price),
      discount: toNumber(data.discount),
      effectivePrice: calcEP(data.price, data.discount),
      durationInDays:
        data.accessType === "SINGLE"
          ? convertToDays(parseInt(data.duration, 10), data.unit)
          : null,
      expiryDate: data.accessType === "EXPIRY_DATE" ? data.expiryDate : null,
      promoted: true,
    };

    onChange("pricingOptions", [singleOption]);
  }, [
    data.accessType,
    data.price,
    data.discount,
    data.duration,
    data.unit,
    data.expiryDate,
  ]);

  // ---------- Generate Installment Preview ----------
  useEffect(() => {
    const price = calcEP(data.price, data.discount);
    if (!totalInstallments || totalInstallments < 1 || price <= 0) {
      setInstallmentPreview([]);
      return;
    }

    const perInstallment =
      Math.floor((price / totalInstallments) * 100) / 100;
    const lastAmount = parseFloat(
      (price - perInstallment * (totalInstallments - 1)).toFixed(2)
    );

    const generated = Array.from({ length: totalInstallments }, (_, i) => ({
      label: `${i + 1} Instalment`,
      amount: i === totalInstallments - 1 ? lastAmount : perInstallment,
      date:
        i === 0
          ? "Date of Purchase (DOP)"
          : `DOP + ${i} ${
              installmentPeriod === "Monthly" ? "month" : "week"
            }${i > 1 ? "s" : ""}`,
    }));

    setInstallmentPreview(generated);
  }, [totalInstallments, data.price, data.discount, installmentPeriod]);

  const accessTypeHints: Record<string, string> = {
    SINGLE: "Course expires after fixed period based on purchase date.",
    MULTIPLE: "Students choose from multiple pricing plans.",
    LIFETIME: "Course never expires for students.",
    EXPIRY_DATE: "Course expires for all students on selected date.",
  };

  return (
    <div className="space-y-6">
      {/* Access Type */}
      <div>
        <Label>Course Access Type</Label>
        <select
          value={data.accessType}
          onChange={(e) => onChange("accessType", e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="SINGLE">Single Validity</option>
          <option value="MULTIPLE">Multiple Validity</option>
          <option value="LIFETIME">Lifetime Validity</option>
          <option value="EXPIRY_DATE">Course Expiry Date</option>
        </select>
        <p className="text-sm text-gray-500 mt-1">
          {accessTypeHints[data.accessType]}
        </p>
      </div>

      {/* Duration for SINGLE */}
      {data.accessType === "SINGLE" && (
        <div className="flex gap-4">
          <Input
            type="number"
            min="1"
            value={data.duration}
            onChange={(e) => onChange("duration", e.target.value)}
          />
          <select
            value={data.unit}
            onChange={(e) => onChange("unit", e.target.value)}
            className="border rounded p-2"
          >
            <option value="year">Years</option>
            <option value="month">Months</option>
            <option value="day">Days</option>
          </select>
        </div>
      )}

      {/* Expiry Date for EXPIRY_DATE */}
      {data.accessType === "EXPIRY_DATE" && (
        <Input
          type="date"
          value={data.expiryDate}
          onChange={(e) => onChange("expiryDate", e.target.value)}
        />
      )}

      {/* Multiple Plans */}
      {data.accessType === "MULTIPLE" && (
        <div className="space-y-4">
          {multiplePlans.map((plan, index) => (
            <div
              key={index}
              className={clsx(
                "p-4 rounded-md border",
                promotedIndex === index ? "border-blue-500 bg-blue-50" : "bg-gray-50"
              )}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">
                  {plan.duration} {plan.unit}(s) • ₹
                  {calcEP(plan.price, plan.discount).toFixed(2)}
                </span>
                {promotedIndex === index && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Promoted
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                <Input
                  type="number"
                  placeholder="Duration"
                  value={plan.duration}
                  onChange={(e) => {
                    const updated = [...multiplePlans];
                    updated[index].duration = e.target.value;
                    setMultiplePlans(updated);
                  }}
                />
                <select
                  value={plan.unit}
                  onChange={(e) => {
                    const updated = [...multiplePlans];
                    updated[index].unit = e.target.value;
                    setMultiplePlans(updated);
                  }}
                  className="border p-2 rounded"
                >
                  <option value="day">Day(s)</option>
                  <option value="month">Month(s)</option>
                  <option value="year">Year(s)</option>
                </select>
                <Input
                  type="number"
                  placeholder="Price"
                  value={plan.price}
                  onChange={(e) => {
                    const updated = [...multiplePlans];
                    updated[index].price = e.target.value;
                    setMultiplePlans(updated);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Discount"
                  value={plan.discount}
                  onChange={(e) => {
                    const updated = [...multiplePlans];
                    updated[index].discount = e.target.value;
                    setMultiplePlans(updated);
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={promotedIndex === index}
                    onChange={() => setPromotedIndex(index)}
                  />
                  Promote this plan
                </label>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setMultiplePlans((plans) => plans.filter((_, i) => i !== index))
                  }
                  className="text-red-500"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            className="text-blue-600 hover:underline flex items-center gap-2"
            onClick={() =>
              setMultiplePlans([
                ...multiplePlans,
                { duration: "", unit: "month", price: "", discount: "" },
              ])
            }
          >
            <PlusCircle size={16} /> Add Plan
          </Button>
        </div>
      )}

      {/* Price for NON-MULTIPLE */}
      {data.accessType !== "MULTIPLE" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              value={data.price}
              onChange={(e) => onChange("price", e.target.value)}
            />
          </div>
          <div>
            <Label>Discount</Label>
            <Input
              type="number"
              value={data.discount}
              onChange={(e) => onChange("discount", e.target.value)}
            />
          </div>
          <div>
            <Label>Effective Price</Label>
            <Input
              type="text"
              readOnly
              className="bg-gray-100"
              value={`₹ ${calcEP(data.price, data.discount).toFixed(2)}`}
            />
          </div>
        </div>
      )}

      {/* Installments (toggle hidden by default) */}
      {showInstallments && (
        <div className="border p-4 rounded-md bg-gray-50 space-y-4">
          <div>
            <Label>Total Installments</Label>
            <Input
              type="number"
              value={totalInstallments}
              min={1}
              onChange={(e) => setTotalInstallments(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Installment Period</Label>
            <select
              value={installmentPeriod}
              onChange={(e) => setInstallmentPeriod(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          {/* Installment Preview */}
          {installmentPreview.length > 0 && (
            <div className="space-y-2">
              {installmentPreview.map((ins, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border rounded p-2 bg-white"
                >
                  <div>
                    <div className="font-semibold">{ins.label}</div>
                    <div className="text-xs text-gray-500">{ins.date}</div>
                  </div>
                  <div className="font-medium">₹{ins.amount}</div>
                </div>
              ))}
              <div className="pt-2 text-sm font-medium">
                {totalInstallments} instalments, Total price: ₹
                {calcEP(data.price, data.discount).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
