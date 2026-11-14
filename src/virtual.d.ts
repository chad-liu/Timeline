declare module 'virtual:timelines' {
  const timelines: import('./types').Timeline[];
  export default timelines;
}

declare module 'virtual:index-people' {
  const people: import('./lib/extraPeople').ExtraPerson[];
  export default people;
}

declare module 'virtual:index-topics' {
  const topics: import('./lib/topicIndex').Topic[];
  export default topics;
}

declare module 'virtual:index-places' {
  const places: import('./lib/places').Place[];
  export default places;
}
