<template>
  <div>
    <button class="deleteNodeBtn" @click="deleteNode">x</button>
  </div>
</template>

<script>
import { toRaw } from "vue";

export default {
  props: ["params"],
  setup(props) {
    const { params } = props;
    const proxy = params.data;
    const date = toRaw(proxy);
    const collectAllChildren = (node) => {
      let nodesToDelete = [node.data];
      if (node.childrenAfterGroup) {
        node.childrenAfterGroup.forEach((childNode) => {
          nodesToDelete = nodesToDelete.concat(collectAllChildren(childNode));
        });
      }
      return nodesToDelete;
    };
    const deleteNode = () => {
      const nodesToRemove = collectAllChildren(params.node);
      params.api.applyTransaction({ remove: nodesToRemove });
    };

    return { date, deleteNode };
  },
};
</script>

<style>
.addChildBtn {
  margin-right: 8px;
  color: green;
}
.deleteNodeBtn {
  margin-left: 8px;
  color: white;
  background-color: red;
  border: 2px solid red;

  padding: 2px 14px 2px 5px;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  border-radius: 100%;
  width: 10%;
}

.deleteNodeBtn:hover {
  background-color: darkred;
  transform: scale(1.05);
}

.deleteNodeBtn:active {
  background-color: crimson;
  transform: scale(0.95);
}
</style>
