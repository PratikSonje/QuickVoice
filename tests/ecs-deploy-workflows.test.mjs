import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

async function workflow(path) {
  return readFile(new URL(`../.github/workflows/${path}`, import.meta.url), "utf8");
}

function assertEcsDeploys(workflowBody, expectedContainerName) {
  assert.match(workflowBody, /group: quickvoice-ecs-deploy-\$\{\{ github\.ref \}\}/);
  assert.match(workflowBody, /ECS_CLUSTER: \$\{\{ vars\.ECS_CLUSTER \}\}/);
  assert.match(workflowBody, /ECS_SERVICE: \$\{\{ vars\.ECS_SERVICE \}\}/);
  assert.match(workflowBody, new RegExp(`ECS_CONTAINER_NAME: \\$\\{\\{ vars\\.[A-Z_]+_ECS_CONTAINER_NAME \\|\\| '${expectedContainerName}' \\}\\}`));

  assert.match(workflowBody, /REQUIRED_ECS_CLUSTER: \$\{\{ env\.ECS_CLUSTER \}\}/);
  assert.match(workflowBody, /REQUIRED_ECS_SERVICE: \$\{\{ env\.ECS_SERVICE \}\}/);

  assert.match(workflowBody, /IMAGE_URI: \$\{\{ steps\.login-ecr\.outputs\.registry \}\}\/\$\{\{ env\.ECR_REPOSITORY \}\}@\$\{\{ steps\.build\.outputs\.digest \}\}/);
  assert.match(workflowBody, /aws ecs describe-services/);
  assert.match(workflowBody, /aws ecs register-task-definition/);
  assert.match(workflowBody, /aws ecs update-service/);
  assert.match(workflowBody, /--force-new-deployment/);
  assert.match(workflowBody, /aws ecs wait services-stable/);
}

test("server image workflow deploys the pushed image to ECS", async () => {
  assertEcsDeploys(await workflow("server-build.yml"), "quickvoice-server");
});

test("AI image workflow deploys the pushed image to ECS", async () => {
  assertEcsDeploys(await workflow("ai-build.yml"), "quickvoice-ai");
});
