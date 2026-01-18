import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  async createCompliancePullRequest(workspaceId: string, repoOwner: string, repoName: string, content: string) {
    // 1. Initialize Octokit with the workspace's encrypted token
    const token = await this.getEncryptedToken(workspaceId);
    const octokit = new Octokit({ auth: token });

    const branchName = `compliance/update-${Date.now()}`;
    const baseBranch = 'main'; // This should ideally be fetched from workspace settings

    // 2. Get the SHA of the latest commit on the base branch
    const { data: refData } = await octokit.git.getRef({
      owner: repoOwner,
      repo: repoName,
      ref: `heads/${baseBranch}`,
    });

    // 3. Create a new branch
    await octokit.git.createRef({
      owner: repoOwner,
      repo: repoName,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha,
    });

    // 4. Create/Update the specification file in the new branch
    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: 'compliance/specification.md',
      message: 'chore(compliance): automated regulatory update',
      content: Buffer.from(content).toString('base64'),
      branch: branchName,
    });

    // 5. Open the Pull Request
    return await octokit.pulls.create({
      owner: repoOwner,
      repo: repoName,
      title: '🛡️ Automated Compliance Update',
      body: 'This PR contains an automated update to your technical specifications based on recent regulatory changes. Review the citations provided in the document.',
      head: branchName,
      base: baseBranch,
    });
  }

  private async getEncryptedToken(id: string) { return 'token'; }
}