import test from "ava"
import {PointHash, RectHash} from "../dist/spatialhash"


test('foo', t => {
  t.pass();
});

test('bar', async t => {
  const bar = Promise.resolve('bar');

  t.is(await bar, 'bar');
});
