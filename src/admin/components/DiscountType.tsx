import clsx from "clsx";

import RadioGroup from "./RadioGroup";

const DISCOUNT_TYPES = {
  FIXED: "FIXED",
  PERCENTAGE: "PERCENTAGE",
};

const DiscountType = ({ typeState }) => {
  const [type, setType] = typeState;
  return (
    <div>
      <RadioGroup.Root
        value={type}
        onValueChange={setType}
        className={clsx("gap-base mt-base flex items-center px-1")}
      >
        <RadioGroup.Item
          value={DISCOUNT_TYPES.PERCENTAGE}
          className="flex-1"
          label="Percentage"
          description={"Discount applied in %"}
        />
        <RadioGroup.Item
          value={DISCOUNT_TYPES.FIXED}
          className="flex-1"
          label="Fixed amount"
          description="Discount in whole numbers"
        />
      </RadioGroup.Root>
    </div>
  );
};

export default DiscountType;
