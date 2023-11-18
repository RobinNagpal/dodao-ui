import Checkboxes, { CheckboxItem } from '@/components/core/checkboxes/Checkboxes';
import { ChatbotCategoryFragment } from '@/graphql/generated/generated-types';
import React from 'react';

interface CategoryCheckboxesProps {
  selectedCategories: string[];
  selectedSubCategories: string[];
  categories: ChatbotCategoryFragment[];
  setSelectedCategories: (selectedCategories: string[]) => void;
  setSelectedSubCategories: (selectedSubCategories: string[]) => void;
}

const CategoryCheckboxes: React.FC<CategoryCheckboxesProps> = ({
  categories,
  setSelectedCategories,
  setSelectedSubCategories,
  selectedCategories,
  selectedSubCategories,
}) => {
  const handleCategorySelectionChange = (categoryKey: string) => {
    const isSelected = !selectedCategories.includes(categoryKey);

    if (isSelected) {
      setSelectedCategories([...selectedCategories, categoryKey]);
      const newSelectedSubCategories = [...selectedSubCategories, ...subCategoryItems(categoryKey).map((item) => item.id)];
      setSelectedSubCategories(newSelectedSubCategories);
    } else {
      setSelectedCategories(selectedCategories.filter((key) => key !== categoryKey));
      setSelectedSubCategories([
        ...selectedSubCategories.filter(
          (key) =>
            !subCategoryItems(categoryKey)
              .map((item) => item.id)
              .includes(key)
        ),
      ]);
    }
  };

  const handleSubCategoryChange = (categoryId: string, selectedItemKeys: string[]) => {
    setSelectedSubCategories(selectedItemKeys);

    // Check if the category should still be selected
    const categorySubItems = subCategoryItems(categoryId).map((item) => item.id);
    const isAnySubSelected = selectedItemKeys.some((key) => categorySubItems.includes(key));

    // Update parent category selection based on subcategories
    if (isAnySubSelected && !selectedCategories.includes(categoryId)) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else if (!isAnySubSelected && selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    }
  };

  const subCategoryItems = (categoryKey: string): CheckboxItem[] => {
    const category = categories.find((cat) => cat.key === categoryKey);
    return (
      category?.subCategories.map((subCategory) => ({
        id: subCategory.key,
        name: subCategory.name,
        label: subCategory.name,
      })) || []
    );
  };

  return (
    <div>
      {categories.map((category) => {
        return (
          <div key={category.key}>
            <Checkboxes
              items={[
                {
                  id: category.key,
                  name: category.name,
                  label: category.name,
                },
              ]}
              className="mt-0"
              selectedItemIds={selectedCategories}
              onChange={(items) => handleCategorySelectionChange(category.key)}
            />
            {category.subCategories.length > 0 && (
              <div key={category.key} className="ml-6">
                <Checkboxes
                  className="mt-0"
                  items={subCategoryItems(category.key)}
                  selectedItemIds={selectedSubCategories}
                  onChange={(selectedItemIds) => handleSubCategoryChange(category.key, selectedItemIds)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryCheckboxes;
