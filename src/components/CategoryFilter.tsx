
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
};

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryFilter = ({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
      <button
        className={cn(
          "px-4 py-2 rounded-md text-sm transition-colors",
          activeCategory === "all"
            ? "bg-primary text-white"
            : "bg-gray-100 hover:bg-gray-200"
        )}
        onClick={() => onSelectCategory("all")}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          className={cn(
            "px-4 py-2 rounded-md text-sm transition-colors",
            activeCategory === category.id
              ? "bg-primary text-white"
              : "bg-gray-100 hover:bg-gray-200"
          )}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
