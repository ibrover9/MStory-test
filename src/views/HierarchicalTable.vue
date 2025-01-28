<template>
  <div class="ag-theme-alpine" style="height: 600px; width: 100%">
    <ag-grid-vue
      class="ag-theme-alpine"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :treeData="true"
      :getDataPath="getDataPath"
      :autoGroupColumnDef="autoGroupColumnDef"
      :groupDefaultExpanded="-1"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community"; // Импортируем все модули

import TreeStore from "@/classes/TreeStore";

// Регистрируем все модули
ModuleRegistry.registerModules([AllCommunityModule]);

const treeStore = new TreeStore([
  { id: 1, parent: null, label: "Айтем 1" },
  { id: "2", parent: 1, label: "Айтем 2" },
  { id: 3, parent: 1, label: "Айтем 3" },
  { id: 4, parent: "2", label: "Айтем 4" },
  { id: 5, parent: "2", label: "Айтем 5" },
  { id: 6, parent: "2", label: "Айтем 6" },
  { id: 7, parent: 4, label: "Айтем 7" },
  { id: 8, parent: 4, label: "Айтем 8" },
]);

const rowData = ref([]);
const columnDefs = ref([
  { field: "label", headerName: "Название" },
  { field: "category", headerName: "Категория" },
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
