import { CommitOptions, Store } from "vuex";
import { Mutations } from "./mutations";
import { RootState } from "./state";

type MyMutations = {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload?: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>;
};

export type MyStore = Omit<Store<RootState>, "commit"> & MyMutations;

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
