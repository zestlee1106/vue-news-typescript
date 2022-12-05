# 뷰 프로젝트에 타입스크립트를 점진적으로 적용하는 방법?

1. Vue + Typescript 프로젝트 생성
2. 기존 서비스 코드와 라이브러리를 새 프로젝트에 이동
3. 기본적인 빌드 에러 해결
4. 타입스크립트의 혜택을 볼 수 있는 주요 파일들을 위주로 `.ts` -> `.ts` 로 변환하며 적용
   > 타입 체킹은 덜 엄격한 방식에서 점점 엄격한 방식으로 적용하는 것을 추천한다.

---

## tsconfig.json 수정 (점진적으로 엄격한 방식으로 적용하기 위함)

1. allowJs 를 true로 설정해 준다.
2. noImplictAny 를 true 로 설정해 준다.

## main.ts 수정

1. 기본이 main.ts 로 되어있을 텐데, src 를 복붙해 주면서 js 파일이 딸려왔기 때문에 빌드 에러가 날 것이다.
2. 해당 파일들을 수정하는 플로우는 아래와 같다.

## api/index.ts 수정

1. 타입스크립트의 장점은, API 리스펀스들을 타입핑 해 준다는 장점이 있다.
2. response 로 받을 객체를 interface 로 선언한 뒤, 함수 리턴 타입을 명시해 주면 된다.
   > AxiosPromise<받을 객체 타입> 이라고 타입핑 해 주면 된다.
3. instance 내부의 index.instance 를 ts 파일로 수정해 준다. (빌드 에러가 나기 때문에 수정해 줬다.)
4. instance는 Axios 내부에 AxiosInstance 타입이 이미 있기 때문에, 반환 타입을 해당 타입으로 설정해 주면 된다.

## routes/index.ts 수정

1. 일단 처음에 알아둬야 할 것이, 기존 프로젝트랑 vue-router 버전이 맞지 않기 때문에, 에러가 날 수도 있다.
   > 그래서 package.json 에 최신 버전이 아닌, 3.0.1 버전으로 명시해 두었다.
2. beforeEnter 등등 vue-router 에서 제공해주는 함수의 인자에 타입을 명시해 주었다.
   > 참고 사항으로... vue-router 최신 버전에서는 타입이 바뀌었기 때문에, 이 파일과 다를 것이다.

---

## Store 수정

- 이 프로젝트의 키포인트이기 때문에 섹션을 따로 나누었다.
- 미리 알아 두어야 할 점은, vue-router 와 동일하게 버전이 맞지 않기 때문에 에러가 난다.
  > 3.0.1 버전으로 명시해 두었다.

### state.ts 추가

1. 기본적으로 사용할 state 를 만들어서 export 해 준다.
2. state 내부에서 사용할 각 상태들은 alias 를 사용하여 타입을 지정해 준다.
3. type 을 생성하여, typeof state객체 요런 식으로 state 의 객체를 뽑아내서 타입핑 해 준다.

### index.ts 수정

1. vue2 를 사용하고 있기 때문에, StoreOptions 타입을 import 하여 해당 타입으로 export 해 준다.
2. 커스텀으로 만든 state 를 import 하여, StoreOptions 의 제네릭에 넣어 준다.
3. vuex의 StoreOptoins 가면 볼 수 있듯이, 해당 제네릭 타입을 내부에서 state, getters 등등에서 사용하기 때문에, 타입 추론이 가능하다.

### mutations.ts 추가

1. mutation 의 key 로 사용할 Mutations 의 enum 타입을 만들어 준다.

   > 기존에는 mutation 의 key 를 상수로 선언하여 사용했으나, enum 타입을 사용하게 되면 ide 의 자동완성을 사용할 수 있기 때문에 더 편해진다.

2. 사용할 mutation 를 내부에서 선언해 준 후 export 를 한다.

   > ```typescript
   > [MutationTypes.SET_NEWS](state: RootState, news: NewsItem[]) {
   >    state.news = news;
   > },
   > ```
   >
   > 위를 살펴 보자면, `'SET_NEWS'(state, news)` 이런 식으로 될 것이다.
   >
   > SET_NEWS 라는 함수를 선언해 준 것이다.

3. mutations 의 type 들을 typeof 로 뽑아내어 type 을 선언해 주고, 그것도 export 한다.

### actions 추가

1. actions 의 key 로 사용할 것을 enum 으로 선언해 준다.
2. actions 의 첫번째 인수로 들어갈 context 의 type 을 선언해 준다.

   > ```typescript
   > type MyActionContext = {
   >   commit<K extends keyof Mutations>(
   >     key: K,
   >     payload?: Parameters<Mutations[K]>[1]
   >   ): ReturnType<Mutations[K]>;
   > } & Omit<ActionContext<RootState, RootState>, "commit">;
   > ```
   >
   > - key의 타입
   >   - keyof 를 통하여 Mutations 의 타입을 literal 로 가지고 온다.
   >   - 그것을 상속 받아 K 제네릭으로 지정한다.
   >   - 해당 K 제네릭 값을 key 의 타입으로 지정한다.
   > - payload 의 타입
   >   - Parameters 라는 ts 의 유틸리티 타입을 사용하여, 파라미터의 타입을 갖고 온다.
   >   - 안의 제네릭으로 튜플 타입을 구성하게 되는데...
   >   - 그 중 index 1의 파라미터의 타입을 갖고 오겠다는 뜻이다.
   >   - Mutations 의 각 mutations 함수들은 state, payload 형태로 되어있기 때문에, 결국 1번째 파라미터의 타입은 Mutation의 1번째 payload 타입인 NewsItem[] 이 될 것이다.
   > - ReturnType
   >   - 반환할 값을 정의하는 것이다.
   >   - Mutations[K] -> 예) SET_NEWS 함수
   >   - ReturnType<Mutations[K]> -> 예) SET_NEWS 함수의 리턴타입으로 지정하겠다.
   > - Omit
   >   - Omit 안의 제네릭 첫번째 타입 내부에서 두번째 타입을 제거하겠단 뜻이다.
   >
   > 전체적으로 정리해 보면...
   >
   > MyActionContext 는 ActionContext 에서 commit 을 제거할 거고,
   >
   > 그 제거한 자리에 commit 을 타입핑해서 넣어 주는 것이다.

## getters 추가

1. getters 추가
2. 해당 getters 를 typeof 후, type으로 export 한다

## types 추가

1. 만들어 준 mutations, actions, getters 각각을 MyStore 를 생성하여 연결해 준다.
2. mutations 연결 부분은 아래와 같다.

   > ```typescript
   > type MyMutations = {
   >   commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
   >     key: K,
   >     payload?: P,
   >     options?: CommitOptions
   >   ): ReturnType<Mutations[K]>;
   > };
   > ```
   >
   > - key, payload의 타입
   >   - 위 [Actions 타입](#actions-추가)의 key, payload를 참고하면 됨
   > - options 의 타입
   >   - vuex 에서 제공해 주는 CommitOptions 를 import 하여 사용
   > - ReturnType
   >   - 위 [Actions 타입](#actions-추가)의 ReturnType 을 참고하면 됨
   >     MyActions 의 내용도 위와 동일하다.

3. getters 연결 부분은 아래와 같다.

   > ```typescript
   > type MyGetters = {
   >   getters: {
   >     [K in keyof Getters]: ReturnType<Getters[K]>;
   >   };
   > };
   > ```
   >
   > in keyof 는 맵드 타입이다.
   > keyof Getters 는 리터럴로 key 를 리턴해 주는데, 그것들을 하나하나 모두 K로 제네릭 타입을 지정하여,
   > 반환 타입해 해당 K 타입으로 Getters 를 가져온 후 ReturnType 으로 지정해 준 것이다.
   > type A = keyof Getters; 이런 식으로 되는 것이다.

4. MyStore 연결 부분은 아래와 같다.

   > ```typescript
   > export type MyStore = Omit<
   >   Store<RootState>,
   >   "commit" | "dispatch" | "getters"
   > > &
   >   MyMutations &
   >   MyActions &
   >   MyGetters;
   > ```
   >
   > vuex의 Store 타입에서 commit, dispatch, getters 를 제거하고, 커스텀으로 만든 타입을 합집합으로 만들어 준 것이다.

## store/index 에 추가

1. vuex 에서 제공해 주는 StoreOptions 에 커스텀 state 를 제네릭으로 잡고, store 의 타입으로 지정한다.
2. store 에 state, mutaions, actions 각각을 객체 프로퍼티로 넣어 준다.
3. 해당 store 를 Vuex.Store 로 export 한다.

근데 위처럼 하더라도 컴포넌트 단위에서 제대로 타입 추론이 안 된다.

해당 원인은, node_modules 의 vuex 에서 vue.d.ts 가 잡혀있기 때문인데,

해당 내용에서 store 타입을 MyStore 를 import 하여 커스텀 스토어로 변경하면 잘 잡힌다.

하지만... 그렇게 하면 문제점이 있다.

1. node_modules 를 삭제하고 수정할 때마다 계속 수정해 줘야 함
2. 프로젝트를 팀에서 사용할 경우 해당 내용을 공유하기게 애매함

따라서 타입 추론이 잘 될 수 있도록 d.ts 파일을 생성해 준다.

## types/project.d.ts 추가

1. vue/types/vue 모듈을 declare 한 후, Vue 인터페이스의 $store 타입을 커스텀 타입으로 변경한다.
2. vue/types/options 의 store 를 커스텀 타입으로 변경한다.

## tsconfig.json 수정

1. include에 위에서 추가한 d.ts 를 추가해 준다.
   1. src/types/\*_/_.d.ts
   2. 프로젝트 진행하며 d.ts 파일을 더 추가해 줄 수도 있기 때문에, 위처럼 경로를 잡는다.

---

## 느낀점

- store 하나를 타입핑 하기 위해서 들어가는 비용이 너무 많은 것 같아서 불편하다는 느낌이 있었다.
- 그래서 Pinia, Vuex4 가 나온 듯 싶고, 새로 만드는 프로젝트라면, vue2 가 아닌 무조건 vue3 를 사용하는 편이 나을 것 같다.
- 또한 위에서 설정해 준 project.d.ts 가 타입추론을 잘 할 수 있도록 하려면 node_modules/~~~/vue.d.ts 파일을 삭제해 줘야 하는데, 그것도 일일이 해 주는 것과 다름이 없기 때문에 불편하단 생각이 들었다.
- 해당 과정을 거치지 않기 위해서 d.ts 를 덮어씌우는 작업을 찾아 봐야 할 것 같다.
