import * as THREE from "three";
export function releaseRenderer(renderer, scene) {
  let clearScene = function (scene) {
    let arr = scene.children.filter((x) => x);
    arr.forEach((item) => {
      if (item.children.length) {
        clearScene(item);
      } else {
        if (item.type === "Mesh") {
          item.geometry.dispose();
          item.material.dispose();
          !!item.clear && item.clear();
        }
      }
    });
    !!scene.clear && scene.clear(renderer);
    arr = null;
  };
  try {
    clearScene(scene);
  } catch (e) {}
  try {
    renderer.renderLists.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement = null;
    renderer.content = null;
    renderer = null;
  } catch (e) {}
  if (!!window.requestAnimationId) {
    cancelAnimationFrame(window.requestAnimationId);
  }
  THREE.Cache.clear();
}
