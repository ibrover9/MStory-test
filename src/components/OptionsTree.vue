<template>
  <div>
    <button class="addChildBtn" @click="addChildNode(nodeData.id)">+</button>
    <button class="deleteNodeBtn" @click="deleteNode1(nodeData.id)">x</button>
  </div>
</template>

<script>
export default {
  props: {
    nodeData: Object,
  },
  methods: {
    addChildNode(id) {
      this.$emit("addChild", id);
    },
    deleteNode1(id) {
      this.$emit("deleteNode", id);
    },
  },
};
</script>

<style scoped>
.addChildBtn {
  /* Стили для кнопки добавления */
}
.deleteNodeBtn {
  /* Стили для кнопки удаления */
}
</style>
