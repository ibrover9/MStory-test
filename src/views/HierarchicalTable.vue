<template>
  <div>
    <button @click="toggleOptionColumn">Показать/Скрыть Option</button>
    <div class="ag-theme-alpine" style="height: 600px; width: 100%">
      <ag-grid-vue
        class="ag-theme-alpine"
        :rowData="rowData"
        :columnDefs="columnDefs"
        :treeData="true"
        :getDataPath="getDataPath"
        :autoGroupColumnDef="autoGroupColumnDef"
        :groupDefaultExpanded="-1"
        :animateRows="true"
        @cell-clicked="cellWasClicked"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { ModuleRegistry, RowSelectionModule } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { TreeDataModule } from "ag-grid-enterprise";
import { ClientSideRowModelModule } from "ag-grid-enterprise";
import OptionsTree from "@/components/OptionsTree.vue";
import { toRaw } from "vue";
import TreeStore from "@/classes/TreeStore";

ModuleRegistry.registerModules([
  AllCommunityModule,
  TreeDataModule,
  ClientSideRowModelModule,
]);

const treeStore = new TreeStore([
  { id: 0, parent: null, label: "Айтем 0" },
  { id: 1, parent: 0, label: "Айтем 1" },
  { id: "2", parent: 1, label: "Айтем 2" },
  { id: 3, parent: 1, label: "Айтем 3" },
  { id: 4, parent: "2", label: "Айтем 4" },
  { id: 5, parent: "2", label: "Айтем 5" },
  { id: 6, parent: "2", label: "Айтем 6" },
  { id: 7, parent: 4, label: "Айтем 7" },
  { id: 11, parent: 10, label: "Айтем 11" },
  { id: 8, parent: 4, label: "Айтем 8" },
  { id: 10, parent: 5, label: "Айтем 10" },
]);

const rowData = ref([]);
const gridApi = ref(null);

// Столбцы для отображения/скрытия
const columnDefs = ref([
  {
    field: "test",
    headerName: "Option",
    editable: true,
    cellRenderer: OptionsTree,
    hide: true, // Изначально скрыт
  },
  {
    field: "category",
    headerName: "Категория",
    editable: true,
  },
  {
    field: "label",
    headerName: "Название",
    editable: true,
  },
  {},
]);

const autoGroupColumnDef = ref({
  headerName: "Группа",
  cellRendererParams: { suppressCount: true },
});

const getDataPath = computed(() => {
  return (data) => data.path;
});

const loadData = () => {
  const traverse = (node, path = []) => {
    const children = treeStore.getChildren(node.id);
    const category = children.length > 0 ? "Группа" : "Элемент";

    const row = {
      id: node.id,
      label: node.label,
      category: category,
      path: [...path, node.label],
    };

    rowData.value.push(row);
    children.forEach((child) => traverse(child, [...path, node.label]));
  };

  treeStore.getChildren(null).forEach((rootNode) => {
    traverse(rootNode);
  });
};

const toggleOptionColumn = () => {
  console.log("Текущий gridApi:", gridApi.value);

  if (gridApi.value) {
    // Получаем текущее состояние столбцов
    const columnState = gridApi.value.getColumnState();

    // Ищем столбец с field "test"
    const optionColumn = columnState.find((col) => col.colId === "test");

    if (optionColumn) {
      // Изменяем свойство hide для столбца
      optionColumn.hide = !optionColumn.hide;

      // Применяем обновленное состояние
      gridApi.value.applyColumnState({
        state: columnState,
        applyOrder: true, // Применяем порядок столбцов, если нужно
      });

      console.log("Обновлены columnDefs:", columnState);
    } else {
      console.error('Столбец с colId "test" не найден');
    }
  } else {
    console.error("gridApi не инициализирован.");
  }
};

const anotherButtonAction = () => {
  console.log("Другая кнопка была нажата");
};

const cellWasClicked = (event) => {
  console.log("Cell clicked:", event);
};

const onGridReady = (params) => {
  console.log("onGridReady: ", params);
  gridApi.value = params.api;
  console.log("Grid API methods:", Object.keys(gridApi.value)); // Выведет все доступные методы
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.ag-theme-alpine {
  height: 100%;
  width: 100%;
}
</style>
