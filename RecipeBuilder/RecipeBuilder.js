var vm = new Vue({
  el: '#RecipeBuilder',
  data: {
    precedences: [
      { task1: 'A1', task2: 'A2' },
      { task1: 'A2', task2: 'A' },
      { task1: 'B1', task2: 'B2' },
      { task1: 'B2', task2: 'B3' },
      { task1: 'B3', task2: 'B' },
      { task1: 'C1', task2: 'C2' },
      { task1: 'C2', task2: 'C' },
    ],
    proctimes: [
      { task: 'A1', eq: 'E4', proctime: 4 },
      { task: 'A2', eq: 'E3', proctime: 5 },
      { task: 'B1', eq: 'E2', proctime: 7 },
      { task: 'B2', eq: 'E1', proctime: 3 },
      { task: 'B2', eq: 'E2', proctime: 5 },
      { task: 'B3', eq: 'E3', proctime: 6 },
      { task: 'C1', eq: 'E4', proctime: 4 },
      { task: 'C1', eq: 'E3', proctime: 3 },
      { task: 'C2', eq: 'E1', proctime: 6 },
      { task: 'C2', eq: 'E2', proctime: 4 },
    ]
  }
})