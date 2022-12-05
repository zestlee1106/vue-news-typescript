import { Getters } from "./getters";
import { CommitOptions, DispatchOptions, Store } from "vuex";
import { Actions } from "./actions";
import { Mutations } from "./mutations";
import { RootState } from "./state";

type MyMutations = {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload?: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>;
};

type MyActions = {
  dispatch<K extends keyof Actions>(
    key: K,
    payload?: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>;
};

type MyGetters = {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>;
  };
};

// MEMO: in keyof 는 맵드 타입임
// 저것들을 다 빼서 하나하나 타입으로 등록해주겠다는 뜻이다
// type A = keyof Getters; <<< 이런 식으로 된다는 것

export type MyStore = Omit<
  Store<RootState>,
  "commit" | "dispatch" | "getters"
> &
  MyMutations &
  MyActions &
  MyGetters;

// Omit ==> 특정 키만 빼고 나머지 값들을 갖겠다
// const person = {
//     name: 'a',
//     age: 10,
//     skill: 'js'
// }
// const Josh = Omit<person, 'skill'>

// 인터섹션 (합집합)
// type A = {
//   name: string;
// };
// type B = {
//   age: number;
// };
// type C = A & B;
// const person: C = {
//   name: "test",
//   age: 10,
// };
