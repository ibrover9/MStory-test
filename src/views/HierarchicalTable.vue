<template>
  <div>
    <button id="toggleEditMode" @click="toggleEditMode">
      Переключить режим редактирования
    </button>
    <div v-if="isEditMode">
      <button @click="addChildNode">Добавить дочерний элемент</button>
      <button @click="undoChanges" :disabled="!canUndo">Назад</button>
      <button @click="redoChanges" :disabled="!canRedo">Вперед</button>
    </div>
    <div class="ag-theme-alpine" style="height: 600px; width: 100%">
      <ag-grid-vue
        class="ag-theme-alpine"
        :rowData="rowData"
        :columnDefs="columnDefs"
        :treeData="true"
        :getDataPath="getDataPath"
        :autoGroupColumnDef="autoGroupColumnDef"
        :groupDefaultExpanded="-1"
        :rowSelection="{ enableClickSelection: true }"
        :editType="'fullRow'"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { TreeDataModule } from "ag-grid-enterprise";
import { ClientSideRowModelModule } from "ag-grid-enterprise";
import OptionsTree from "@/components/OptionsTree.vue";

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

const history = ref([]);
let currentHistoryIndex = ref(-1);

const rowData = ref([]);
const columnDefs = ref([
  { field: "category", headerName: "Категория", editable: true },
  { field: "label", headerName: "Название", editable: true },
  {
    headerName: "Действия",
    cellRendererFramework: (params) => {
      if (isEditMode.value) {
        return h(ActionButtons, {
          nodeData: params.node.data, // Передаем данные узла в компонент
          onAddChild: (id) => addChildNode1(id), // Привязываем метод добавления
          onDeleteNode: (id) => deleteNode1(id), // Привязываем метод удаления
        });
      }
      return null;
    },
  },
]);

// Пример методов для добавления и удаления
const addChildNode1 = (id) => {
  console.log(`Добавить дочерний элемент для ID ${id}`);
  // Логика добавления узла
};

const deleteNode1 = (id) => {
  console.log(`Удалить узел с ID ${id}`);
  // Логика удаления узла
};

const autoGroupColumnDef = ref({
  headerName: "Группа",
  cellRendererParams: { suppressCount: true },
});

const isEditMode = ref(false);

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

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

const addChildNode = (parentId) => {
  const newId = treeStore.getNextId();
  treeStore.addNode({
    id: newId,
    parent: parentId,
    label: `Новый элемент ${newId}`,
  });

  const newNode = {
    id: newId,
    label: `Новый элемент ${newId}`,
    category: "Элемент",
    path: [...treeStore.getNodePath(parentId), `Новый элемент ${newId}`],
  };

  rowData.value.push(newNode);
  addHistory({ action: "add", node: newNode });
};

function deleteNode1(id) {
  const nodeToDelete = rowData.value.find((node) => node.id === id);
  if (nodeToDelete) {
    const children = treeStore.getAllChildren(id);
    children.push(nodeToDelete); // Добавляем родительский элемент
    treeStore.removeItem(id);
    rowData.value = rowData.value.filter(
      (node) => !children.some((child) => child.id === node.id)
    );
    addHistory({ action: "delete", node: nodeToDelete });
  }
}

const addHistory = (action, node) => {
  history.value.push({ action, node });
  currentHistoryIndex.value = history.value.length - 1;
};

const undoChanges = () => {
  if (canUndo) {
    const lastChange = history.value[currentHistoryIndex.value];
    if (lastChange.action === "add") {
      deleteNode(lastChange.node.id); // Реализуй логику удаления последнего добавленного узла.
    } else if (lastChange.action === "delete") {
      addChildNode(lastChange.node.parent); // Повторно добавляем удаленный узел.
    }
    currentHistoryIndex.value--;
  }
};

const redoChanges = () => {
  if (canRedo) {
    currentHistoryIndex.value++;
    const nextChange = history.value[currentHistoryIndex.value];
    if (nextChange.action === "add") {
      addChildNode(nextChange.node.parent); // Повторно добавляем добавленный узел.
    } else if (nextChange.action === "delete") {
      deleteNode(nextChange.node.id); // Повторно удаляем узел.
    }
  }
};

const canUndo = computed(() => currentHistoryIndex.value >= 0);
const canRedo = computed(
  () => currentHistoryIndex.value < history.value.length - 1
);

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
