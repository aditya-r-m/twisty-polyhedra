function distsq4(p1, p2) {
  return (
    (p1.w - p2.w) ** 2 +
    (p1.x - p2.x) ** 2 +
    (p1.y - p2.y) ** 2 +
    (p1.z - p2.z) ** 2
  );
}
