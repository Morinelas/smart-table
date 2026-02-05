import './fonts/ys-display/fonts.css'
import './style.css'

//import {data as sourceData} from "./data/dataset_1.js";
import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Инициализируем API для работы с данными
const api = initData();

// Модули будут инициализированы в init()
let applySearching;
let applyFiltering;
let applySorting;
let applyPagination;
let updatePagination;

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    console.log('🎬 Render вызван. Action:', action?.name);
    
    let state = collectState();
    let query = {}; // здесь будут формироваться параметры запроса
    
    // TODO: Адаптировать эти модули под серверную работу
    query = applySearching(query, state, action);
    
    // Применяем фильтрацию
    if (applyFiltering) {
        query = applyFiltering(query, state, action);
    }
    
    // TODO: Адаптировать сортировку
    query = applySorting(query, state, action);
    
    // Применяем пагинацию ДО запроса
    if (applyPagination) {
        query = applyPagination(query, state, action);
    }

    // Запрашиваем данные с сервера
    console.log('📋 Параметры запроса:', query);
    const { total, items } = await api.getRecords(query);
    console.log('📊 Получено данных:', items.length, 'из', total);
    
    // Обновляем пагинатор после получения данных
    if (updatePagination) {
        updatePagination(total, query);
    }
    
    // Отображаем данные
    sampleTable.render(items);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

/**
 * Асинхронная инициализация приложения
 */
async function init() {
    // 1. Получаем индексы (списки продавцов, клиентов и т.д.)
    const indexes = await api.getIndexes();
    console.log('✅ Индексы загружены:', indexes);
    
    // 2. Инициализируем модули с полученными индексами
    
    // Пагинация
    const { applyPagination: applyPag, updatePagination: updatePag } = initPagination(
        sampleTable.pagination.elements,
        (el, page, isCurrent) => {
            const input = el.querySelector('input');
            const label = el.querySelector('span');
            input.value = page;
            input.checked = isCurrent;
            label.textContent = page;
            return el;
        }
    );
    
    applyPagination = applyPag;
    updatePagination = updatePag;
    
    // Фильтрация
    const { applyFiltering: applyFilt, updateIndexes } = initFiltering(sampleTable.filter.elements);
    applyFiltering = applyFilt;
    
    // Обновляем индексы в фильтрах (заполняем выпадающие списки)
    updateIndexes({
        searchBySeller: indexes.sellers
    });
    
    // TODO: Адаптировать остальные модули
    
    applySorting = initSorting([
        sampleTable.header.elements.sortByDate,
        sampleTable.header.elements.sortByTotal
    ]);
    
    applySearching = initSearching('search');
    
    
    // 3. Обработка кнопки reset в search
setTimeout(() => {
    const resetButton = document.querySelector('.search-bar button[type="reset"]');
    if (resetButton) {
        resetButton.type = 'button';
        resetButton.addEventListener('click', async function() {
            console.log('🔄 Reset all filters нажата');
            
            // Создаем action для полного сброса
            const resetAction = {
                name: 'reset-all',
                type: 'reset',
                target: this
            };
            
            // 1. Очищаем поиск
            const searchInput = document.querySelector('input[name="search"]');
            if (searchInput) searchInput.value = '';
            
            // 2. Очищаем все фильтры
            document.querySelectorAll('.filter-wrapper input, .range-inputs input').forEach(input => {
                input.value = '';
            });
            
            // 3. Сбрасываем select
            document.querySelectorAll('select').forEach(select => {
                select.selectedIndex = 0;
            });
            
            // 4. Сбрасываем сортировку
            document.querySelectorAll('button[name="sort"]').forEach(button => {
                if (button.dataset.value) {
                    button.dataset.value = 'none';
                }
            });
            
            // 5. Сбрасываем пагинацию на первую страницу
            const firstPageInput = document.querySelector('input[name="page"][value="1"]');
            if (firstPageInput) {
                firstPageInput.checked = true;
            }
            
            // 6. Вызываем render с action reset
            await render(resetAction);
        });
    }
}, 100);
    
    return indexes;
}

// Запускаем инициализацию, затем рендер
init().then(() => {
    console.log('🚀 Инициализация завершена, запускаем первый рендер...');
    render();
});