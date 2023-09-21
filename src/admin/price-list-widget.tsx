import type { WidgetConfig } from "@medusajs/admin";
import {
  Button,
  Container,
  FocusModal,
  Heading,
  Input,
  Label,
  RadioGroup
} from "@medusajs/ui";
import {
  useAdminCollections,
  useAdminProductCategories,
  useAdminProductTypes,
  useAdminProducts,
  useAdminUpdatePriceList,
  useProductTags
} from "medusa-react";
import { useMemo, useState } from "react";
import ReactSelect from "react-select";

const DISCOUNT_TYPES = {
  FIXED: "FIXED",
  PERCENTAGE: "PERCENTAGE",
};

const CustomPrices = ({ notify, priceList }) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(DISCOUNT_TYPES.FIXED);
  // get categories list
  const { product_categories = [] } = useAdminProductCategories();
  const { mutate } = useAdminUpdatePriceList(priceList.id);
  const { product_tags } = useProductTags();
  const { collections } = useAdminCollections();
  const { product_types } = useAdminProductTypes();
  const { products } = useAdminProducts({
    limit: 0,
  });

  const [selectedCategories, setSelectedCategories] = useState<any>([]);
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const [selectedCollections, setSelectedCollections] = useState<any>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<any>([]);
  const [discountValue, setDV] = useState(null);

  const categories = product_categories?.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const tags = product_tags?.map((c) => ({
    value: c.id,
    label: c.value,
  }));
  const collectionsList = collections?.map((c) => ({
    value: c.id,
    label: c.title,
  }));
  const productTypesList = product_types?.map((c) => ({
    value: c.id,
    label: c.value,
  }));

  const productsSelected = useMemo(() => {
    const tagsValues = selectedTags.map((t) => t.value);
    const catValues = selectedCategories.map((t) => t.value);
    return products?.filter((p) => {
      const { categories, tags, type, collection } = p;
      return (
        tags?.some((t) => tagsValues.includes(t.id)) ||
        categories?.some((c) => catValues.includes(c.id)) ||
        selectedCollections.includes(collection) ||
        selectedProductTypes.some((c) => type.id === c.value)
      );
    });
  }, [
    selectedCategories,
    selectedTags,
    products,
    selectedCollections,
    selectedProductTypes,
  ]);

  function applyPricing() {
    if (type === DISCOUNT_TYPES.PERCENTAGE && discountValue > 100) {
      notify.error("error", "Discount percentage cannot be more than 100");
    }
    const preparePrices = {
      prices: productsSelected
        ?.filter((p) => p.variants.length > 0)
        ?.map((p) =>
          p.variants
            ?.map((v) =>
              v.prices?.map((price) => ({
                variant_id: price.variant_id,
                amount: Math.max(
                  Math.round(
                    type === DISCOUNT_TYPES.FIXED
                      ? price.amount - discountValue
                      : price.amount * ((100 - discountValue) / 100)
                  ),
                  0
                ),
                currency_code: price.currency_code,
              }))
            )
            .flat()
        )
        .flat(),
    };

    mutate(preparePrices, {
      onSuccess: () => {
        notify.success("success", "Prices updated");
        // setOpen(false);
        // location.reload();
      },
      onError: (error) => {
        console.log({ error });
        notify.error("error", "Error updating prices");
      },
    });
  }

  return (
    <Container>
      <FocusModal open={open} onOpenChange={() => setOpen(false)}>
        <Button
          onClick={() => setOpen(true)}
          variant="primary"
          size="large"
          className="w-full"
        >
          Show dymanic selection form
        </Button>
        <FocusModal.Content>
          <FocusModal.Body className="flex flex-col items-center py-16 gap-10">
            <div className="flex w-full max-w-lg flex-col gap-y-8">
              <div className="flex flex-col gap-y-1">
                <Heading>Edit Prices list by group</Heading>
                <RadioGroup defaultValue={type} onValueChange={setType}>
                  <div className="flex items-start gap-x-3">
                    <RadioGroup.Item
                      value={DISCOUNT_TYPES.FIXED}
                      id="radio_1_descriptions"
                    />
                    <div className="flex flex-col gap-y-0.5">
                      <Label htmlFor="radio_1_descriptions" weight="plus">
                        Fixed amount
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-start gap-x-3">
                    <RadioGroup.Item
                      value={DISCOUNT_TYPES.PERCENTAGE}
                      id="radio_2_descriptions"
                    />
                    <div className="flex flex-col gap-y-0.5">
                      <Label htmlFor="radio_2_descriptions" weight="plus">
                        Percentage
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
                <div>
                  <Label htmlFor="dv-input" weight="plus">
                    Value
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={type === DISCOUNT_TYPES.PERCENTAGE ? 100 : Infinity}
                    id="dv-input"
                    value={discountValue}
                    onChange={(e) => setDV(e.target.value)}
                  />
                </div>
                <div className="flex flex-row justify-between w-full gap-x-3">
                  <div className="flex flex-col gap-y-1">
                    <Label htmlFor="radio_2_descriptions" weight="plus">
                      Categories
                    </Label>
                  </div>
                  <ReactSelect
                    className="basic-single w-1/2"
                    classNamePrefix="Categories"
                    onChange={(e) => setSelectedCategories(e)}
                    isClearable
                    isSearchable
                    isMulti
                    options={categories}
                  />
                </div>
                <div className="flex flex-row justify-between w-full gap-x-3">
                  <div className="flex flex-col gap-y-1">
                    <Label htmlFor="radio_2_descriptions" weight="plus">
                      Collections
                    </Label>
                  </div>
                  <ReactSelect
                    className="basic-single w-1/2"
                    classNamePrefix="Collections"
                    onChange={(e) => setSelectedCollections(e)}
                    isClearable
                    isSearchable
                    isMulti
                    options={collectionsList}
                  />
                </div>
                <div className="flex flex-row justify-between w-full gap-x-3">
                  <div className="flex flex-col gap-y-1">
                    <Label htmlFor="radio_2_descriptions" weight="plus">
                      Types
                    </Label>
                  </div>
                  <ReactSelect
                    className="basic-single w-1/2"
                    classNamePrefix="Categories"
                    onChange={(e) => setSelectedProductTypes(e)}
                    isClearable
                    isSearchable
                    isMulti
                    options={productTypesList}
                  />
                </div>
                <div className="flex flex-row justify-between w-full gap-x-3">
                  <div className="flex flex-col gap-y-1">
                    <Label htmlFor="radio_2_descriptions" weight="plus">
                      Tags
                    </Label>
                  </div>
                  <ReactSelect
                    className="basic-single w-1/2"
                    classNamePrefix="Categories"
                    onChange={(e) => setSelectedTags(e)}
                    isClearable
                    isSearchable
                    isMulti
                    options={tags}
                  />
                </div>
              </div>
            </div>
            <div>
              Selected products: {productsSelected?.length}/{products?.length}
            </div>
            <Button
              variant="primary"
              size="large"
              className="w-40"
              disabled={productsSelected?.length === 0 || discountValue === 0}
              onClick={applyPricing}
            >
              Apply pricing
            </Button>
            {/* <ProductTable
              products={productsSelected}
              type={type}
              value={discountValue}
            /> */}
          </FocusModal.Body>
        </FocusModal.Content>
      </FocusModal>
    </Container>
  );
};

export const config: WidgetConfig = {
  zone: "price_list.details.after",
};

export default CustomPrices;
