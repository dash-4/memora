import { BookOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../cards/Card";

export default function DeckCard({ deck }) {
  const color = deck.color || "#3B82F6";

  return (
    <Link
      to={`/decks/${deck.id}`}
      className="block h-full group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-2xl"
    >
      <Card
        className={`
          h-full flex flex-col overflow-hidden
          bg-white border border-gray-200 rounded-2xl
          shadow-sm hover:shadow-md transition-all duration-300
          group-hover:border-blue-300 group-hover:-translate-y-1
        `}
      >
        <div className=" pb-3 sm:pb-4">
          <div className="flex items-start justify-between">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: `${color}15` }}
            >
              <BookOpen
                size={24}
                style={{ color }}
                className="transition-transform duration-300 group-hover:rotate-3"
              />
            </div>
          </div>
        </div>

        <div className="pb-4 sm:pb-5 flex-1 flex flex-col">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
            {deck.name}
          </h3>

          {deck.description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1">
              {deck.description}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
