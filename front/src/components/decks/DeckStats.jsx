import { BookOpen, Calendar, PlusCircle } from "lucide-react";
import Card from "../cards/Card";

export default function DeckStats({ total, dueToday, newCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <Card className="p-5 sm:p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Всего карточек</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
          </div>
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <BookOpen size={20} className="text-gray-600" />
          </div>
        </div>
      </Card>

      <Card
        className={`
        p-5 sm:p-6 border rounded-xl transition-colors
        ${dueToday > 0 ? "border-blue-300 bg-blue-50/30" : "border-gray-200"}
      `}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">На повторение</p>
            <p
              className={`
              text-3xl font-bold mt-1
              ${dueToday > 0 ? "text-blue-700" : "text-gray-400"}
            `}
            >
              {dueToday}
            </p>
          </div>
          <div
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${dueToday > 0 ? "bg-blue-100" : "bg-gray-100"}
          `}
          >
            <Calendar
              size={20}
              className={dueToday > 0 ? "text-blue-600" : "text-gray-500"}
            />
          </div>
        </div>
      </Card>

      <Card
        className={`
        p-5 sm:p-6 border rounded-xl transition-colors
        ${
          newCount > 0
            ? "border-emerald-300 bg-emerald-50/30"
            : "border-gray-200"
        }
      `}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Новые карточки</p>
            <p
              className={`
              text-3xl font-bold mt-1
              ${newCount > 0 ? "text-emerald-700" : "text-gray-400"}
            `}
            >
              {newCount}
            </p>
          </div>
          <div
            className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${newCount > 0 ? "bg-emerald-100" : "bg-gray-100"}
          `}
          >
            <PlusCircle
              size={20}
              className={newCount > 0 ? "text-emerald-600" : "text-gray-500"}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
