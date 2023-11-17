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
  const handleCategoryChange = (selectedItemKeys: string[]) => {
    setSelectedCategories(selectedItemKeys);
    const newSelectedSubCategories =
      selectedItemKeys.length > 0
        ? categories
            .filter((category) => selectedItemKeys.includes(category.key))
            .flatMap((category) => category.subCategories.map((subCategory) => subCategory.key))
        : [];
    setSelectedSubCategories(newSelectedSubCategories);
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
              onChange={handleCategoryChange}
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
