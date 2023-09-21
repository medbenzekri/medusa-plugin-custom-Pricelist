import { Input, Label } from "@medusajs/ui";

const DISCOUNT_TYPES = {
  FIXED: "FIXED",
  PERCENTAGE: "PERCENTAGE",
};

function DiscountInput({ type, value, onChange }) {
  const label =
    type === DISCOUNT_TYPES.PERCENTAGE ? "Percentage %" : "Amount $";

  return (
    <div>
      <Label htmlFor="dv-input" weight="plus">
        {label}
      </Label>
      <Input
        type="number"
        placeholder="15,20,50.."
        min={0}
        max={type === DISCOUNT_TYPES.PERCENTAGE ? 100 : Infinity}
        id="dv-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}

export default DiscountInput;
