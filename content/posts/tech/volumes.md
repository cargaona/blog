---
title: "Volumes on Kubernetes"
date: 2020-07-21T14:42:32-03:00
draft: false
categories: ["tech"]
tags: ["kubernetes", "devops"]
---


The first things you need to understand from volumes in kubernetes are the following concepts:

- Persistent volumes (PV)
- Persistent volumes claim (PVC)
- Storage Classes

#### Persistent volumes:
The PVs are the volumes you are going to mount to your pod(s). It's an abstraction from the storage you are using. With this object you don't care if you are using EFS, EBS, or even a logic partition in your bare metal server.

#### Persistent volumes claim:
It's another abstaction. From the kubernetes management perspective PVCs are object kinds used to claim a PV that you will attach to your pods.

#### StorageClasses:
Althought PV and PVC are abstractions and you don't have to care about the provider of the storage. Well...  But somebody has to manage that! You can define an object kind "storageclass" where you are going to state who's the provisioner, what kind of storage you want and some other details will be taking place in just a minute.

### The approach with EKS
When you deploy a cluster using EKS, at least with v1.13, it will have it's own storage class by default. You can read it using the next command:

```bash
>> kubectl get storageclass
```

As you can see, it is  using `gp2` (General Purpose SSD drives) and the fstype is `ext4`.
The provisioner is, as we could expect, `kubernetes.io/aws-ebs`

Later on, you could add an option that can be very useful.

```bash
>> kubectl edit storageclass gp2
```

It will open an editor (I hope vim shows up in your terminal) and you are going to add the next line at the end of the document. After that, you can write and quit (Yes, **esc + :wq**. Just in case...)

With this "edit" you are able not only to create and assign volumes but also to resize the existing drives.

> It should be all set up to start creating some volumes!
But before you start struggling because you are not allowed to create, list, or read existing volumes; check if your workers/nodes have permission to create, list, or read on the EBS service with the proper policy and role.

### Let's create and use a volume
You need to create it before you assign it. In order to do that, we are going to create a... yaml file! :fireworks:

The kind you need is a "PersistentVolumeClaim"

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-claim
spec:
  accessModes:
    - ReadWriteOnce
    ### What is this? Here you are:
    ### https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes
  resources:
    requests:
      storage: 5Gi
```

You may be thinking I'm going to use this volume for a Redis deployment. Well... you are right.

Next step, create that redis deployment.

> Remember that you can merge both chunks of yaml into just one file by separating the objects with three lines **---**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: redis-master
spec:
  selector:
    matchLabels:
      app: redis
  replicas: 1
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - image: redis
          name: master
          resources:
            requests:
              cpu: 100m
              memory: 100Mi
          ports:
            - containerPort: 6379
              name: redis
          volumeMounts:
            - name: redis-storage
              mountPath: /data/redis
      volumes:
        - name: redis-storage
          persistentVolumeClaim:
            claimName: redis-claim

```

Now that you have created a deployment of Redis. There are some fields you want to pay attention.

At **volumeMounts** we specify the name of our volume and where it will be mounted. At the volumes section we declarated this volume mentioned before but in reference to the PVC object in the upper section of the YAML.

Let's save this file as *redis.yaml* and apply it to our cluster to check what happens.

```bash
>> kubectl apply -f redis.yaml
```
After applying it succesfully, take a look on the objects created:

```bash
>> kubectl get pv
NAME      CAPACITY   RECLAIM POLICY   STATUS   STORAGECLASS REASON   AGE
pvc-5fa   5Gi  Delete    default/redis-claim     gp2                 1m
```
That's ok. Our volume has been created. You can check in your AWS console and you'll find it there as well.

That was the information for the volume, but what about our claim? Let's find out.

```bash
>> kubectl get pvc
NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
redis-claim         Bound    pvc-5fa81c2c-bff6-11ea-afce-125a87077339   5Gi        RWO            gp2            2m

```
It's ok. We are happy because along with our deployment we created a volume and the pods have access to the it.

### What if we want to resize the volume?
Do you remember that we added the _AllowVolumeExpansion_ field to our storage class? This is why.

In order to resize the volume you just have to change the size in your PVC object and apply it.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi # Updated from 5Gi
---
#...
```

Run the kubectl magic to apply it.
Give it some some seconds and run

```bash
>> kubectl get pv
```

And you can check that the capacity of your volume is now of the desired size: 10GB.

Did our pods notice this?

```bash
>> kubectl get pvc
```
Mmm... 5GB there.

You'll need to restart the pods and let your deployment start them again to get the 10GB configuration impact the application.



------

- [For existing volumes](https://medium.com/pablo-perez/launching-a-pod-with-an-existing-ebs-volume-mounted-in-k8s-7b5506fa7fa3)
- https://kubernetes.io/docs/concepts/storage/persistent-volumes/
- https://www.youtube.com/watch?v=0swOh5C3OVM
