# create-pr.ps1 - Enhanced Pull Request Auto Creation and Merge Script
param(
    [Parameter(Mandatory=$true)][string]$Title,
    [Parameter(Mandatory=$true)][string]$Body
)

Write-Host "Starting PR automation..." -ForegroundColor Green

try {
    # Check for uncommitted changes and commit them
    $status = git status --porcelain
    if ($status) {
        Write-Host "Found uncommitted changes, committing..." -ForegroundColor Yellow
        git add .
        git commit -m "chore: commit pending changes before PR creation"
        git push
    }

    # Check if PR already exists for current branch
    $currentBranch = git rev-parse --abbrev-ref HEAD
    $existingPR = gh pr list --head $currentBranch --json number --jq '.[0].number' 2>$null
    
    if ($existingPR -and $existingPR -ne "null") {
        Write-Host "Pull request already exists: #$existingPR" -ForegroundColor Yellow
        Write-Host "Proceeding to merge existing PR..." -ForegroundColor Green
        $prNumber = $existingPR
    } else {
        # Create new pull request
        Write-Host "Creating new pull request..." -ForegroundColor Green
        gh pr create --title $Title --body $Body
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Pull request created successfully" -ForegroundColor Green
            $prNumber = gh pr view --json number --jq '.number'
        } else {
            Write-Host "Pull request creation failed" -ForegroundColor Red
            exit 1
        }
    }
    
    # Merge pull request
    Write-Host "Merging pull request #$prNumber..." -ForegroundColor Green
    gh pr merge $prNumber --merge
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Merge completed!" -ForegroundColor Green
        
        # Update local branch
        Write-Host "Updating local master branch..." -ForegroundColor Green
        git checkout master
        git pull origin master
        
        Write-Host "Automation completed successfully!" -ForegroundColor Green
        Write-Host "PR URL: https://github.com/purplehoge/memo-app/pull/$prNumber" -ForegroundColor Cyan
    } else {
        Write-Host "Merge failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}