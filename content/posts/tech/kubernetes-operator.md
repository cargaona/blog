---
title: "Kubernetes Operator Concepts"
date: 2020-07-21T14:42:32-03:00
draft: true
categories: ["tech"]
tags: ["kubernetes", "devops"]
---

My goal with this article is to provide the simplest explanations that I would
loved to have when I started reading about this topic. I don't want to write
example code, I just want to talk about concepts. 

- What is an operator btw?
- Custom Resource Definition.
- Spec and Status.
- Reconcile Loop. 
- Finalizers.
- Garbage Collector and Object Ownership.


## What is a Kubernetes Operator by the way? 

A Kubernetes Operator is a _Controller_ of a specific application.

As the Kubernetes documentation states:

>Operators are software extensions to Kubernetes that make use of custom
>resources to manage applications and their components. Operators follow
>Kubernetes principles, notably the control loop’.

## What is a Custom Resource Definition? 

The Custom Resource Definition (CRD) is an object in Kubernetes that allows us
to create our own Custom "Kind" defining what are the properties it will have.

In this way, besides of the native objects of Kubernetes like, for exampĺe,
Deployment or Ingress, we can create our Custom Resources and will be the
Operator the one who is in charge of the reconcile logic of our new resource.

Within the Operator live the rules that define the behaviour of our Custom
Resources: when it should be deleted, when it should be updated, which objects
should it create or the validations it must do.

## Spec, Status and Metadata. 

The Metadata is, as its name says, the data about that specific resource. Most
common fields for the metadata are  Name, Namespaces and Annotations. Those are
the one you usually define when you are creating a resource. But there are more
that can be very useful in order to control its lifecycle.

On the other side, you probably noticed that in your Deployments there is this
field called **Spec**. Within the spec key there are various fields that
changes depending on the **Kind** of your object. Deployments have different
Spec fields than Ingress or Services. 

They are basically the fields that must be filled with values by the user in
order to tell Kubernetes what are we expecting to have. 

The **Spec** fields for your Custom Resource are declared in your Custom
Resource Definition. You are telling Kubernetes what are the fields supposed to
be filled by the user.

You also declared **Status** fields within de CRD. It serves to observe the
current status of the resource while the Operator is changing it. The Operator
will read the Specs, will try to make the needed changes and it will update the
status during the process. Once the Spec declated matches the object living in
Kubernetes the Status will stop updating and the resource

## The Reconcile Loop.  

Kubebuilder and OperatorSDK will help you with this Reconcile Loop. With the
mentioned Framework I was aable to write the logic to *reconcile* those
diferences between the desired state and the actual state.

To understand this topic very down to Earth, the Reconcile Loop will be a
method in your Operator Code, already declared and provided by the framework
you chase. 

Every time that a Custom Resource linked to this Operator is changed, the
Reconcile Loop will start receiving the data of the object that will modify. 

Here is when you need to check if the object must be deleted, updated or
created, and write the logic in accordance to those actions.

## External or Internal Resources. 

When you are creating an Operator you will notice that there are mainly two
alternatives. You will want to control a resource or a couple of resouces
running within your cluster. Or in the other hand you will want to control
resources outside your cluster.

The first option is very common, there are a lot of Operators around that help
us with managing Prometheus deployments, MySQL databases, or Nginx Ingress
Controllers. This kind of Operator creates resources that live in the cluster.
At the end of the day, the custom resources are backed by pods running a
particular application. Of course, they save you from a lot of manual
intervention and that's the best of the Operators.

For the second option an example can be the creation of a DynamoDB instance in
AWS. This resource won't live inside the cluster. Is an external resource. You
will have to use the AWS SDK to create/modify/update the resource, which will
be represented within the cluster by an object, for example, with the name
"dynamoDB". Perhaps you can run `kubectl get dynamodb` and a list with your
tables will show below, those are just representations of your external
resources. Those objects serves to maintain the status and as a interface for
the users to create this resource from the cluster and not having to log in to
the AWS Console to create it.

Various useful things can be done with this kind of operator. You will want to
automate the creation of the IAM Role required to access de DB created. You can
also could create a Secret or a Config Map with related information. 

## Garbage Collector and Object Ownership 

As I mentioned before, your Operator will create not only one Kubernetes
resource each time. It can create various associated items.  Let's think about
a native resource of Kubernetes: The Deployment. When you create a Deployment
you are creating at least a Pod.  What happens if you delete the Pod associated
to the Deployment. It will be relaunched. Why? Because the Deployment owns it,
and it's watching it. The controller for the Deployment is triggered when the
Pod is deleted, and it *reconciles* the desired status by launching again your
Pod.

If you delete the Deployment, all the "child" Pods will be deleted. Why does
the Pods get deleted when the Deployment is deleted too? Because of the
Kubernetes Garbage Collector. If you have a resource that owns other resources,
when the parent resource is deleted, the paretnless child resources are deleted
by the Garbage Colletor, so you don't have to worry about writing a logic to
delete al the child resources that your resource have.

This was very tricky for me to accomplish and it still looks as magic trickery,
so I give you some links where you can read more about the implementation.[^1]




## Finalizers

The _finalizer_ field is a field that lives in the metadata.  When the field is
present your resource (or any Kubernetes resource) won't be deleted even when
you hit Intro with all your forces. This field is very useful when your
Operator manages external resources.

If you delete a internal resource it will just disappear. But if you delete an
Kubernetes Resource that has a external resource (remember our dynamoDB example
below), the resource representation in the cluster will be erased but the
external resource will be alive. 

The trick here is to assign a finalizer value to the Custom Resources which
represent the external resource when this is created.

That way when you run `kubectl delete myresouce`it won't be deleted
automatically and there es when you have time to run the logic to dlete your
external resource. Once it's deleted you can remove the finalizer value and
your resource will be finally deleted.[^2]


[^1]: https://github.com/kubernetes-sigs/kubebuilder/issues/618
https://github.com/pulumi/pulumi-kubernetes-operator/commit/abe714dc470c

[^2]: https://book.kubebuilder.io/reference/using-finalizers.html



