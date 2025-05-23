from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, BasePermission
from courses.serializers import CourseSerializer, CourseMaterialSerializer
from django.shortcuts import get_object_or_404
from .models import Course, CourseMaterial
from rest_framework.exceptions import ValidationError
from supabase_client import supabase
from rest_framework.response import Response
from rest_framework import status
from urllib.parse import urlparse
from quiz.models import QuizModel
from quiz.tasks import generate_questions_task, delete_material_and_quiz
import time
import logging

logger = logging.getLogger(__name__)

# Check if the user is the owner, use as permission for the views
class IsOwner(BasePermission):
  def has_object_permission(self, request, view, obj):
    return obj.user == request.user

# View function for showing the courses that the current user has made.
# Also serves as a view for creating new courses
class CourseView(generics.ListCreateAPIView):
  serializer_class = CourseSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_queryset(self):
    start_time = time.time()
    courses = self.request.user.courses.all()
    logger.info(f"Total get_queryset method of course list took {time.time() - start_time:.3f} seconds")
    return courses

  def perform_create(self, serializer):
    serializer.save(user=self.request.user)
  
# View for showing all the materials in a course. It will return the materials'
# associated with the user and the course he clicked.
# This also serves as a view for uploading new materials.
class CourseMaterialsView(generics.ListCreateAPIView):
  serializer_class = CourseMaterialSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_queryset(self):
    start_time = time.time()
    # Get course_id from the URL parameters
    course_id = self.kwargs['course_id']
    
    # Ensure the course exists and belongs to the current user
    course = get_object_or_404(Course, id=course_id, user=self.request.user)
    
    # Return all materials related to the course
    materials = course.materials.all()
    logger.info(f"Total get_queryset method of course materials view took {time.time() - start_time:.3f} seconds")
    return materials
  
  def perform_create(self, serializer):
    start_time = time.time()
    # get course id from params
    course_id = self.kwargs['course_id']
    course = get_object_or_404(Course, id=course_id)

    serializer.save(course=course)
    # get currently uploaded material
    material = serializer.instance

    # if course has been created, create a quiz then pregenerate questions based on this(just saved) material
    # different quiz_generator for each material, so that the quiz_title is unique and each request to 
    # generate questions based on that material will have a separate quiz object they can steal from
    quiz = QuizModel.objects.create(
      quiz_title=f"pregenerated-quiz-{material.file_name}",
      course=course, 
      is_generated=True,
      number_of_questions=20
    )
    quiz.material_list.add(material)
    # delay the task to generate questions
    try:
      generate_questions_task.delay(quiz.id, quiz.number_of_questions)
    except Exception as e:
      raise ValidationError(f"Error generating questions: {str(e)}")
    logger.info(f"Total perform_create of material creation took {time.time() - start_time:.3f} seconds")

class CourseMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CourseMaterialSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_object(self):
    start_time = time.time()
    material = get_object_or_404(CourseMaterial, id=self.kwargs["material_id"], course__user=self.request.user)
    logger.info(f"Total get_object method of course material detail view took {time.time() - start_time:.3f} seconds")
    return material
  
  # override the delete method to delete the material from supabase and the object from the database
  def delete(self, request, *args, **kwargs):
    start_time = time.time()
    material = self.get_object()
    quiz_title = f"pregenerated-quiz-{material.file_name}"
    file_url = material.material_file_url

    # Delete objects immediately in DB (or just mark deleted depending on your logic)
    QuizModel.objects.filter(quiz_title=quiz_title).delete()
    material.delete()

    # Then queue the actual Supabase removal async
    delete_material_and_quiz.delay(quiz_title, file_url)
    logger.info(f"Total delete method of course material detail view took {time.time() - start_time:.3f} seconds")
    return Response(status=status.HTTP_204_NO_CONTENT)

# Single instance view of a course, showing details
# and allowing updates
class CourseDetailView(generics.RetrieveUpdateAPIView):
  serializer_class = CourseSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  # Look into the course list in database and select the corresponding course_id from the request
  def get_object(self):
    start_time = time.time()
    course = get_object_or_404(Course, id=self.kwargs["course_id"], user=self.request.user)
    logger.info(f"Total get_object method of course detail view took {time.time() - start_time:.3f} seconds")
    return course
  
class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
  serializer_class = CourseMaterialSerializer
  permission_classes = [IsAuthenticated, IsOwner]

  def get_object(self):
    return get_object_or_404(CourseMaterial, id=self.kwargs["material_id"], course__user=self.request.user)
