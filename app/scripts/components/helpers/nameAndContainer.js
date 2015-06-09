export default concept => {
  let {container} = concept;
  let label = concept.name;
  let containerName = container ? container.name : undefined;
  if (containerName) label += ` in ${containerName}`;

  return label;
};
