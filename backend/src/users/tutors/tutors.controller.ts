import { Controller, Post, Body, ParseIntPipe } from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { CreateTutorDto } from './dto/create-tutor.dto';

@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  /**
   * Create a new tutor profile for an existing user.
   * The userId is expected to be passed in the body, linking to an existing user.
   */
  @Post()
  createTutor(
    @Body('userId', ParseIntPipe) userId: number, // userId of the existing user becoming a tutor
    @Body() createTutorDto: CreateTutorDto,
  ) {
    return this.tutorsService.createTutorProfile(userId, createTutorDto);
  }

  // /**
  //  * Get all tutor profiles with optional filtering and pagination.
  //  */
  // @Get()
  // findAllTutors(@Query() findAllTutorsDto: FindAllTutorsDto) {
  //   return this.tutorsService.findAllTutors(findAllTutorsDto);
  // }

  // /**
  //  * Get a specific tutor profile by their user ID.
  //  */
  // @Get(':id')
  // findTutorById(@Param('id', ParseIntPipe) id: number) {
  //   return this.tutorsService.findTutorById(id);
  // }

  // /**
  //  * Update a tutor's profile.
  //  */
  // @Patch(':id')
  // updateTutor(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateTutorDto: UpdateTutorDto,
  // ) {
  //   return this.tutorsService.updateTutorProfile(id, updateTutorDto);
  // }

  // /**
  //  * Delete a tutor's profile.
  //  */
  // @Delete(':id')
  // removeTutor(@Param('id', ParseIntPipe) id: number) {
  //   return this.tutorsService.removeTutorProfile(id);
  // }

  // // --- Endpoints for Tutor Work Experiences ---

  // /**
  //  * Get all work experiences for a specific tutor.
  //  */
  // @Get(':tutorId/work-experiences')
  // getTutorWorkExperiences(@Param('tutorId', ParseIntPipe) tutorId: number) {
  //   return this.tutorsService.getTutorWorkExperiences(tutorId);
  // }

  // /**
  //  * Add a new work experience for a specific tutor.
  //  */
  // @Post(':tutorId/work-experiences')
  // addTutorWorkExperience(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Body() createDto: CreateTutorWorkExperienceDto,
  // ) {
  //   return this.tutorsService.addTutorWorkExperience(tutorId, createDto);
  // }

  // /**
  //  * Update a specific work experience for a tutor.
  //  */
  // @Patch(':tutorId/work-experiences/:experienceId')
  // updateTutorWorkExperience(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Param('experienceId', ParseIntPipe) experienceId: number,
  //   @Body() updateDto: UpdateTutorWorkExperienceDto,
  // ) {
  //   return this.tutorsService.updateTutorWorkExperience(
  //     tutorId,
  //     experienceId,
  //     updateDto,
  //   );
  // }

  // /**
  //  * Remove a specific work experience for a tutor.
  //  */
  // @Delete(':tutorId/work-experiences/:experienceId')
  // removeTutorWorkExperience(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Param('experienceId', ParseIntPipe) experienceId: number,
  // ) {
  //   return this.tutorsService.removeTutorWorkExperience(tutorId, experienceId);
  // }

  // // --- Endpoints for Tutor Subjects ---

  // /**
  //  * Get all subjects for a specific tutor.
  //  */
  // @Get(':tutorId/subjects')
  // getTutorSubjects(@Param('tutorId', ParseIntPipe) tutorId: number) {
  //   return this.tutorsService.getTutorSubjects(tutorId);
  // }

  // /**
  //  * Add a new subject for a specific tutor.
  //  */
  // @Post(':tutorId/subjects')
  // addTutorSubject(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Body() createDto: CreateTutorSubjectDto,
  // ) {
  //   return this.tutorsService.addTutorSubject(tutorId, createDto);
  // }

  // /**
  //  * Remove a specific subject for a tutor.
  //  * Note: tutorSubjects has a composite key (tutorId, subjectId, gradeId).
  //  * For simplicity, this endpoint might remove all entries for a subjectId or require more specific params.
  //  * Here, we assume removal by subjectId and gradeId for a given tutor.
  //  */
  // @Delete(':tutorId/subjects/:subjectId/grades/:gradeId')
  // removeTutorSubject(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Param('subjectId', ParseIntPipe) subjectId: number,
  //   @Param('gradeId', ParseIntPipe) gradeId: number,
  // ) {
  //   return this.tutorsService.removeTutorSubject(tutorId, subjectId, gradeId);
  // }

  // // --- Endpoints for Tutor Educations ---

  // /**
  //  * Get all educations for a specific tutor.
  //  */
  // @Get(':tutorId/educations')
  // getTutorEducations(@Param('tutorId', ParseIntPipe) tutorId: number) {
  //   return this.tutorsService.getTutorEducations(tutorId);
  // }

  // /**
  //  * Add a new education for a specific tutor.
  //  */
  // @Post(':tutorId/educations')
  // addTutorEducation(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Body() createDto: CreateTutorEducationDto,
  // ) {
  //   return this.tutorsService.addTutorEducation(tutorId, createDto);
  // }

  // /**
  //  * Update a specific education for a tutor.
  //  */
  // @Patch(':tutorId/educations/:educationId')
  // updateTutorEducation(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Param('educationId', ParseIntPipe) educationId: number,
  //   @Body() updateDto: UpdateTutorEducationDto,
  // ) {
  //   return this.tutorsService.updateTutorEducation(
  //     tutorId,
  //     educationId,
  //     updateDto,
  //   );
  // }

  // /**
  //  * Remove a specific education for a tutor.
  //  */
  // @Delete(':tutorId/educations/:educationId')
  // removeTutorEducation(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Param('educationId', ParseIntPipe) educationId: number,
  // ) {
  //   return this.tutorsService.removeTutorEducation(tutorId, educationId);
  // }

  // // --- Endpoints for Tutor ID Documents ---

  // /**
  //  * Get all ID documents for a specific tutor.
  //  */
  // @Get(':tutorId/id-documents')
  // getTutorIdDocuments(@Param('tutorId', ParseIntPipe) tutorId: number) {
  //   return this.tutorsService.getTutorIdDocuments(tutorId);
  // }

  // /**
  //  * Add a new ID document for a specific tutor.
  //  */
  // @Post(':tutorId/id-documents')
  // addTutorIdDocument(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Body() createDto: CreateTutorIdDocumentDto,
  // ) {
  //   return this.tutorsService.addTutorIdDocument(tutorId, createDto);
  // }

  // /**
  //  * Update a specific ID document for a tutor.
  //  */
  // @Patch(':tutorId/id-documents/:documentId')
  // updateTutorIdDocument(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Param('documentId', ParseIntPipe) documentId: number,
  //   @Body() updateDto: UpdateTutorIdDocumentDto,
  // ) {
  //   return this.tutorsService.updateTutorIdDocument(
  //     tutorId,
  //     documentId,
  //     updateDto,
  //   );
  // }

  // /**
  //  * Remove a specific ID document for a tutor.
  //  */
  // @Delete(':tutorId/id-documents/:documentId')
  // removeTutorIdDocument(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Param('documentId', ParseIntPipe) documentId: number,
  // ) {
  //   return this.tutorsService.removeTutorIdDocument(tutorId, documentId);
  // }

  // // --- Endpoints for Tutor Teaching Licenses ---

  // /**
  //  * Get all teaching licenses for a specific tutor.
  //  */
  // @Get(':tutorId/teaching-licenses')
  // getTutorTeachingLicenses(@Param('tutorId', ParseIntPipe) tutorId: number) {
  //   return this.tutorsService.getTutorTeachingLicenses(tutorId);
  // }

  // /**
  //  * Add a new teaching license for a specific tutor.
  //  */
  // @Post(':tutorId/teaching-licenses')
  // addTutorTeachingLicense(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Body() createDto: CreateTutorTeachingLicenseDto,
  // ) {
  //   return this.tutorsService.addTutorTeachingLicense(tutorId, createDto);
  // }

  // /**
  //  * Update a specific teaching license for a tutor.
  //  */
  // @Patch(':tutorId/teaching-licenses/:licenseId')
  // updateTutorTeachingLicense(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Param('licenseId', ParseIntPipe) licenseId: number,
  //   @Body() updateDto: UpdateTutorTeachingLicenseDto,
  // ) {
  //   return this.tutorsService.updateTutorTeachingLicense(
  //     tutorId,
  //     licenseId,
  //     updateDto,
  //   );
  // }

  // /**
  //  * Remove a specific teaching license for a tutor.
  //  */
  // @Delete(':tutorId/teaching-licenses/:licenseId')
  // removeTutorTeachingLicense(
  //   @Param('tutorId', ParseIntPipe) tutorId: number,
  //   @Param('licenseId', ParseIntPipe) licenseId: number,
  // ) {
  //   return this.tutorsService.removeTutorTeachingLicense(tutorId, licenseId);
  // }

  // // --- Endpoints for Tutor Verification ---

  // /**
  //  * Mark a tutor as verified.
  //  * Typically an admin-only action.
  //  */
  // @Patch(':id/verify')
  // verifyTutor(@Param('id', ParseIntPipe) id: number) {
  //   return this.tutorsService.verifyTutor(id);
  // }

  // /**
  //  * Unmark a tutor as verified.
  //  * Typically an admin-only action.
  //  */
  // @Patch(':id/unverify')
  // unverifyTutor(@Param('id', ParseIntPipe) id: number) {
  //   return this.tutorsService.unverifyTutor(id);
  // }

  // // --- Endpoints for Tutor's User Details ---

  // /**
  //  * Get the core user details associated with a tutor.
  //  */
  // @Get(':id/user-details')
  // getTutorUserDetails(@Param('id', ParseIntPipe) id: number) {
  //   return this.tutorsService.getTutorUserDetails(id);
  // }

  // // --- Endpoints for Tutor's Address ---
  // // Note: Address management might also live in a dedicated AddressController
  // // or be part of a general UsersController for updating user profiles.
  // // These are provided as tutor-centric convenience endpoints.

  // /**
  //  * Get the primary address for a tutor.
  //  */
  // @Get(':id/address')
  // getTutorAddress(@Param('id', ParseIntPipe) id: number) {
  //   return this.tutorsService.getTutorAddress(id);
  // }

  // /**
  //  * Update the primary address for a tutor.
  //  * Assumes the tutor's user record has one primary address.
  //  */
  // @Put(':id/address')
  // updateTutorAddress(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateAddressDto: UpdateAddressDto,
  // ) {
  //   return this.tutorsService.updateTutorAddress(id, updateAddressDto);
  // }

  // /**
  //  * Get all tutors with optional filters (e.g., isVerified, subjectId, gradeId, countryId, stateId, educationTypeId, workInstitution, certificationName).
  //  * Example query: /tutors?isVerified=true&subjectId=1&gradeId=2
  //  * This endpoint is now consolidated into the main GET /tutors endpoint with FindAllTutorsDto.
  //  * Keeping the specific filter endpoints for now, but they could be deprecated in favor of the main queryable endpoint.
  //  */
  // // @Get('') // This is now handled by findAllTutors with FindAllTutorsDto
  // // getTutorsWithFilters(@Query() query: FindAllTutorsDto) {
  // //   return this.tutorsService.getTutorsWithFilters(query);
  // // }

  // /**
  //  * Get all tutors who teach a specific subject and grade.
  //  */
  // @Get('by-subject/:subjectId/grade/:gradeId')
  // getTutorsBySubjectAndGrade(
  //   @Param('subjectId', ParseIntPipe) subjectId: number,
  //   @Param('gradeId', ParseIntPipe) gradeId: number,
  // ) {
  //   return this.tutorsService.getTutorsBySubjectAndGrade(subjectId, gradeId);
  // }

  // /**
  //  * Get all tutors in a specific country and/or state (by address).
  //  */
  // @Get('by-country/:countryId')
  // getTutorsByCountry(@Param('countryId', ParseIntPipe) countryId: number) {
  //   return this.tutorsService.getTutorsByCountry(countryId);
  // }

  // @Get('by-country/:countryId/state/:stateId')
  // getTutorsByCountryAndState(
  //   @Param('countryId', ParseIntPipe) countryId: number,
  //   @Param('stateId', ParseIntPipe) stateId: number,
  // ) {
  //   return this.tutorsService.getTutorsByCountryAndState(countryId, stateId);
  // }

  // /**
  //  * Get all verified or unverified tutors.
  //  */
  // @Get('verified/:status')
  // getTutorsByVerificationStatus(@Param('status') status: 'true' | 'false') {
  //   return this.tutorsService.getTutorsByVerificationStatus(status === 'true');
  // }

  // /**
  //  * Get all tutors by education type (e.g., Bachelor, Master, PhD).
  //  */
  // @Get('by-education-type/:educationTypeId')
  // getTutorsByEducationType(@Param('educationTypeId', ParseIntPipe) educationTypeId: number) {
  //   return this.tutorsService.getTutorsByEducationType(educationTypeId);
  // }

  // /**
  //  * Get all tutors by work institution (e.g., school, company).
  //  */
  // @Get('by-work-institution/:workInstitution')
  // getTutorsByWorkInstitution(@Param('workInstitution') workInstitution: string) {
  //   return this.tutorsService.getTutorsByWorkInstitution(workInstitution);
  // }

  // /**
  //  * Get all tutors by teaching license certification name.
  //  */
  // @Get('by-certification/:certificationName')
  // getTutorsByCertification(@Param('certificationName') certificationName: string) {
  //   return this.tutorsService.getTutorsByCertification(certificationName);
  // }

  // /**
  //  * Get all tutors who have a specific subject in their teaching license.
  //  */
  // @Get('by-license-subject/:subjectArea')
  // getTutorsByLicenseSubject(@Param('subjectArea') subjectArea: string) {
  //   return this.tutorsService.getTutorsByLicenseSubject(subjectArea);
  // }

  // /**
  //  * Get all tutors who have a specific grade level in their teaching license.
  //  */
  // @Get('by-license-grade/:gradeLevel')
  // getTutorsByLicenseGrade(@Param('gradeLevel') gradeLevel: string) {
  //   return this.tutorsService.getTutorsByLicenseGrade(gradeLevel);
  // }

  // /**
  //  * Get all tutors who have a specific country in their ID document.
  //  */
  // @Get('by-id-country/:countryId')
  // getTutorsByIdDocumentCountry(@Param('countryId', ParseIntPipe) countryId: number) {
  //   return this.tutorsService.getTutorsByIdDocumentCountry(countryId);
  // }

  // /**
  //  * Get all tutors who have a specific province/state in their ID document.
  //  */
  // @Get('by-id-province/:provinceId')
  // getTutorsByIdDocumentProvince(@Param('provinceId', ParseIntPipe) provinceId: number) {
  //   return this.tutorsService.getTutorsByIdDocumentProvince(provinceId);
  // }
}
