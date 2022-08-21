import { Vue } from "vue";
import { MyStore } from "@/store/types";

// MEMO: node_modules/vuex/types/vue.d.ts 파일을 삭제해 줘야 아래 타입이 정상 추론됨
declare module "vue/types/vue" {
  interface Vue {
    $store: MyStore;
  }
}

declare module "vue/types/optoins" {
  interface ComponentOptions<V extends Vue> {
    store?: MyStore;
  }
}
