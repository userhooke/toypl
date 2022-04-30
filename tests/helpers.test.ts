import { ok } from "assert";
import getGitTagVersion from "../lib/helpers/getGitTagVersion";

const tests = [
  () => {
    const semverRe = /^v(\d+\.)?(\d+\.)?(\*|\d+)$/;
    const v = getGitTagVersion();
    ok(typeof v === "string");
    ok(semverRe.test(v));
  },
];

export default function () {
  for (let test of tests) {
    test();
  }
}
