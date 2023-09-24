import type { WidgetConfig } from "@medusajs/admin";
import { Button, Container, FocusModal, Heading, Label } from "@medusajs/ui";
import {
  useAdminCollections,
  useAdminProductCategories,
  useAdminProductTypes,
  useAdminProducts,
  useAdminUpdatePriceList,
  useProductTags,
} from "medusa-react";
import { useMemo, useState } from "react";
import ReactSelect from "react-select";
import DiscountInput from "../components/DiscountInput";
import DiscountType from "../components/DiscountType";

const DISCOUNT_TYPES = {
  FIXED: "FIXED",
  PERCENTAGE: "PERCENTAGE",
};

const CustomPrices = ({ notify, priceList }) => {
  const [open, setOpen] = useState(false);
  const typeState = useState(DISCOUNT_TYPES.PERCENTAGE);
  const [discountValue, setDV] = useState(0);
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
        (collection &&
          selectedCollections.some((c) => c.value === collection?.id)) ||
        (type && selectedProductTypes.some((c) => type.id === c.value))
      );
    });
  }, [
    selectedCategories,
    selectedTags,
    products,
    selectedCollections,
    selectedProductTypes,
  ]);

  const isDisabled =
    (typeState[0] === DISCOUNT_TYPES.PERCENTAGE && discountValue > 100) ||
    productsSelected?.length === 0 ||
    discountValue === 0;

  function applyPricing() {
    if (typeState[0] === DISCOUNT_TYPES.PERCENTAGE && discountValue > 100) {
      return notify.error(
        "error",
        "Discount percentage cannot be more than 100"
      );
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
                    typeState[0] === DISCOUNT_TYPES.FIXED
                      ? price.amount - discountValue * 100
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
    console.log(preparePrices);
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
          <FocusModal.Header>
            <Button
              variant="primary"
              size="large"
              className="w-40"
              disabled={isDisabled}
              onClick={applyPricing}
            >
              Apply pricing
            </Button>
          </FocusModal.Header>
          <FocusModal.Body className="flex flex-col items-center py-16 gap-10 overflow-scroll">
            <div className="flex w-full max-w-lg flex-col gap-y-8">
              <div className="flex flex-col gap-4">
                <Heading>Edit Prices list by group</Heading>
                <DiscountType typeState={typeState} />
                <DiscountInput
                  type={typeState[0]}
                  value={discountValue}
                  onChange={setDV}
                />
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
