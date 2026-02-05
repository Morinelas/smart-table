let pageCount; // храним количество страниц для обработки действия "last"

export function initPagination(elements, renderCallback) {
    // Функция для формирования параметров пагинации (вызывается ДО запроса)
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // Обработка кнопок пагинации
        if (action) {
            switch (action.name) {
                case 'first':
                    page = 1;
                    break;
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = Math.min(pageCount || Infinity, page + 1);
                    break;
                case 'last':
                    page = pageCount || 1;
                    break;
            }
        }

        // Возвращаем обновленный query с параметрами пагинации
        return Object.assign({}, query, {
            limit,
            page
        });
    };

    // Функция для обновления UI пагинации (вызывается после получения данных)
    const updatePagination = (total, { page, limit }) => {
        // Вычисляем общее количество страниц
        pageCount = Math.ceil(total / limit);

        // Вывод информации о текущем отображении
        elements.fromRow.textContent = ((page - 1) * limit + 1);
        elements.toRow.textContent = Math.min(page * limit, total);
        elements.totalRows.textContent = total;

        // Генерация и вывод кнопок страниц
        // Очищаем контейнер страниц
        while (elements.pages.children.length > 0) {
            elements.pages.lastChild.remove();
        }

        // Создаем кнопки страниц
        const pageButtons = [];
        
        // Определяем диапазон отображаемых страниц
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(pageCount, page + 2);
        
        // Если страниц меньше 5, показываем все
        if (pageCount <= 5) {
            startPage = 1;
            endPage = pageCount;
        } else {
            // Корректируем диапазон у краев
            if (page <= 3) {
                endPage = 5;
            } else if (page >= pageCount - 2) {
                startPage = pageCount - 4;
            }
        }
        
        // Создаем кнопки страниц
        for (let i = startPage; i <= endPage; i++) {
            const label = document.createElement('label');
            label.className = 'pagination-button';
            label.setAttribute('aria-label', `Goto page ${i}`);
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'page';
            input.value = i;
            input.checked = i === page;
            
            const span = document.createElement('span');
            span.textContent = i;
            
            label.appendChild(input);
            label.appendChild(span);
            
            // Используем callback для настройки кнопки
            renderCallback(label, i, i === page);
            
            pageButtons.push(label);
        }
        
        // Добавляем кнопки в контейнер
        elements.pages.append(...pageButtons);
    };

    return {
        updatePagination,
        applyPagination
    };
}