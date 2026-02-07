import { defineStore } from "pinia";
import { ref } from "vue";

import type { User } from "~/types";

// 本地默认用户
const LOCAL_USER: User = {
  sub: "local-user",
  id: "local-user",
  username: "本地用户",
  avatar: "",
  name: "本地用户",
  membership: {
    isActive: false,
    details: undefined,
  },
};

export const useUserStore = defineStore("user", () => {
  const user = ref<User>(LOCAL_USER);

  function initUser(val?: Partial<User>) {
    if (val) {
      user.value = { ...LOCAL_USER, ...val };
    } else {
      user.value = LOCAL_USER;
    }
  }

  function isNewUser() {
    return false; // 本地版不需要新用户引导
  }

  async function setupNewUser(_info: { username: string; avatar: string }) {
    // no-op in local version
  }

  function isFounderMembership() {
    return false;
  }

  return {
    user,
    isNewUser,
    initUser,
    setupNewUser,
    isFounderMembership,
  };
});
