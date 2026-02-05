export function initSearching(searchField) {
    console.log('🔍 Инициализация поиска для поля:', searchField);

    // Функция для формирования параметров поиска (вызывается ДО запроса)
    const applySearching = (query, state, action) => {
        console.log('🔎 Поиск: значение поля', searchField, '=', state[searchField]);
        
        // Если в поле поиска есть текст, добавляем параметр search в query
        if (state[searchField] && state[searchField].trim() !== '') {
            console.log('✅ Добавляем поисковый запрос в параметры:', state[searchField]);
            return Object.assign({}, query, {
                search: state[searchField].trim()
            });
        }
        
        // Если поле поиска пустое, возвращаем query без изменений
        console.log('ℹ️ Поле поиска пустое, не добавляем параметр');
        return query;
    };

    return applySearching;
}