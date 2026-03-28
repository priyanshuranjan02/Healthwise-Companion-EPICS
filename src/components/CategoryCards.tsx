import { Heart, Brain, Baby, User } from "lucide-react";

interface CategoryCardsProps {
  t: Record<string, string>;
  onSelect: (category: string) => void;
}

const categories = [
  { key: "physical", icon: Heart, color: "text-critical", bg: "bg-critical/10" },
  { key: "mental", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
  { key: "womens", icon: User, color: "text-accent", bg: "bg-accent/10" },
  { key: "child", icon: Baby, color: "text-warning", bg: "bg-warning/10" },
];

const labelMap: Record<string, string> = {
  physical: "physicalHealth",
  mental: "mentalHealth",
  womens: "womensHealth",
  child: "childHealth",
};

const descMap: Record<string, string> = {
  physical: "physicalDesc",
  mental: "mentalDesc",
  womens: "womensDesc",
  child: "childDesc",
};

const CategoryCards = ({ t, onSelect }: CategoryCardsProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto">
        <h2 className="mb-2 text-center text-3xl font-bold text-foreground">{t.categories}</h2>
        <p className="mb-10 text-center text-muted-foreground">{t.chooseCategory}</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ key, icon: Icon, color, bg }) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="group flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bg} transition-transform group-hover:scale-110`}>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t[labelMap[key]]}</h3>
              <p className="text-sm text-muted-foreground">{t[descMap[key]]}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
