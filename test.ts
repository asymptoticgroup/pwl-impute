import { assert } from "jsr:@std/assert";
import impute from "./mod.ts";

function dist(a: { x: number; y: number }[], b: { x: number; y: number }[]) {
  if (a.length !== b.length) {
    return Number.NaN;
  }
  let response = 0;
  for (let i = 0; i < a.length; i++) {
    const dx = b[i].x - a[i].x;
    const dy = b[i].y - a[i].y;
    response = Math.max(response, dx * dx + dy * dy);
  }
  return response;
}

Deno.test("Test Debug", () => {
  const points = [
    { x: 1, y: 1 },
    { x: Number.NaN, y: 2 },
    { x: 3, y: Number.NaN },
    { x: 4, y: 4 },
  ];

  impute(points, "x", "y", 0, 0);

  assert(
    dist(points, [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ]) === 0
  );
});

Deno.test("Test Simple", () => {
  const points = [
    { x: 1, y: 1 },
    { x: Number.NaN, y: Number.NaN },
    { x: 3, y: 3 },
  ];

  impute(points, "x", "y", 0, 0);

  assert(
    dist(points, [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ]) === 0
  );
});

Deno.test("Test Partial", () => {
  const points = [
    { x: 1, y: 1 },
    { x: 2, y: Number.NaN },
    { x: 3, y: 3 },
  ];

  impute(points, "x", "y", 0, 0);

  assert(
    dist(points, [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ]) === 0
  );
});

Deno.test("Test Complex 1", () => {
  const points = [
    { x: 0.75, y: 0.5 },
    { x: 2, y: Number.NaN },
    { x: Number.NaN, y: 2 },
    { x: 3, y: 3 },
  ];

  impute(points, "x", "y", 0, 0);

  assert(
    dist(points, [
      { x: 0.75, y: 0.5 },
      { x: 2, y: 1.25 },
      { x: 2.5, y: 2 },
      { x: 3, y: 3 },
    ]) === 0
  );
});

Deno.test("Test Complex 2", () => {
  const points = [
    { x: 0.5, y: 1 },
    { x: 2, y: Number.NaN },
    { x: Number.NaN, y: 2 },
    { x: 3, y: 3 },
  ];

  impute(points, "x", "y", 0, 0);

  assert(
    dist(points, [
      { x: 0.5, y: 1 },
      { x: 2, y: 1.5 },
      { x: 2.5, y: 2 },
      { x: 3, y: 3 },
    ]) === 0
  );
});

Deno.test("Test Vertical", () => {
  const points = [
    { x: 1, y: 1 },
    { x: 1, y: Number.NaN },
    { x: 1, y: Number.NaN },
    { x: 1, y: 4 },
  ];

  impute(points, "x", "y", 0, 0);

  assert(
    dist(points, [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
    ]) === 0
  );
});

Deno.test("Test Horizontal", () => {
  const points = [
    { x: 1, y: 1 },
    { x: Number.NaN, y: 1 },
    { x: Number.NaN, y: 1 },
    { x: 4, y: 1 },
  ];

  impute(points, "x", "y", 0, 0);

  assert(
    dist(points, [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
    ]) === 0
  );
});

Deno.test("Test Default X", () => {
  const points = [
    { x: Number.NaN, y: 1 },
    { x: Number.NaN, y: 2 },
    { x: Number.NaN, y: 3 },
    { x: Number.NaN, y: 4 },
  ];

  impute(points, "x", "y", 0, 5);

  assert(
    dist(points, [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
    ]) === 0
  );
});

Deno.test("Test Default Y", () => {
  const points = [
    { y: Number.NaN, x: 1 },
    { y: Number.NaN, x: 2 },
    { y: Number.NaN, x: 3 },
    { y: Number.NaN, x: 4 },
  ];

  impute(points, "x", "y", 0, 5);

  assert(
    dist(points, [
      { y: 5, x: 1 },
      { y: 5, x: 2 },
      { y: 5, x: 3 },
      { y: 5, x: 4 },
    ]) === 0
  );
});
