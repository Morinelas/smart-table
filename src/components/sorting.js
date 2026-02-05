import {sortMap} from "../lib/sort.js";

export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // Запоминаем выбранный режим сортировки
            action.dataset.value = sortMap[action.dataset.value]; // Сохраним и применим как текущее следующее состояние из карты
            field = action.dataset.field; // Информация о сортируемом поле есть также в кнопке
            order = action.dataset.value; // Направление заберём прямо из датасета для точности

            // Сбросить сортировки остальных колонок
            columns.forEach(column => {
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = 'none';
                }
            });
        } else {
            // Получить выбранный режим сортировки
            columns.forEach(column => {
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        // Формируем параметр сортировки для сервера
        const sort = (field && order !== 'none') ? `${field}:${order}` : null;

        // Добавляем параметр сортировки к query, если он есть
        return sort ? Object.assign({}, query, { sort }) : query;
    };
}