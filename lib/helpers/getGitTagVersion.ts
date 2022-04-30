import { execSync } from "child_process";

const gitCommand = "git tag";

export default function getGitTagVersion() {
  return execSync(gitCommand).toString().trim().split("\n").pop();
}
