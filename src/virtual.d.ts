declare module 'virtual:timelines' {
  const timelines: import('./types').Timeline[];
  export default timelines;
}

declare module 'virtual:index-people' {
  const people: import('./lib/extraPeople').ExtraPerson[];
  export default people;
}
