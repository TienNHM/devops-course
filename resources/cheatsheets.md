# Cheatsheets

## Docker
```bash
docker run -d --name web -p 8081:80 nginx:1.27-alpine
docker ps -a
docker logs -f web
docker exec -it web sh
docker inspect web
docker stop web && docker rm web
docker build -t club-api:1.0.0 ./backend
docker compose up -d --build
docker compose logs -f backend
docker compose down        # thêm -v sẽ xóa volume
```

## kubectl
```bash
kubectl config get-contexts
kubectl get pods -n club
kubectl describe pod <pod> -n club
kubectl logs <pod> -n club --previous
kubectl exec -it <pod> -n club -- sh
kubectl port-forward -n club svc/club-web 8080:80
kubectl apply -f k8s/
kubectl scale deployment club-api --replicas=3 -n club
kubectl rollout status deployment/club-api -n club
kubectl rollout undo deployment/club-api -n club
kubectl get events -n club --sort-by=.metadata.creationTimestamp
```

## Git
```bash
git switch -c feature/x
git add -p && git commit -m "feat: ..."
git push -u origin feature/x
```
