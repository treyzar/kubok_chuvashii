package handlers

import (
	"context"

	"github.com/SomeSuperCoder/OnlineShop/repository"
)

type CategoryHandler struct {
	Repo *repository.Queries
}



type GetCategoryRequest struct{}
type GetCategoryResponse struct {
	Body struct {
		Categories []CategoryEntry `json:"categories"`
	}
}

type CategoryEntry struct {
	CategoryInfo  repository.Category      `json:"category_info"`
	Subcategories []repository.Subcategory `json:"subcategories"`
}

func (h *CategoryHandler) Get(ctx context.Context, req *GetCategoryRequest) (*GetCategoryResponse, error) {
	resp := new(GetCategoryResponse)

	categories, err := h.Repo.GetCategories(ctx)
	if err != nil {
		return nil, err
	}
	resp.Body.Categories = make([]CategoryEntry, 0, len(categories))

	for _, cat := range categories {
		subcategories, err := h.Repo.GetSubcategoriesFor(ctx, repository.GetSubcategoriesForParams{
			CategoryID: cat.ID,
		})
		if err != nil {
			return nil, err
		}

		resp.Body.Categories = append(resp.Body.Categories, CategoryEntry{
			CategoryInfo:  cat,
			Subcategories: subcategories,
		})
	}

	return resp, nil
}



type CreateCategoryRequest struct {
	Body struct {
		Name string `json:"name" minLength:"2" maxLength:"100"`
	}
}

type CreateCategoryResponse struct {
	Body repository.Category `json:"category"`
}

func (h *CategoryHandler) CreateCategory(ctx context.Context, req *CreateCategoryRequest) (*CreateCategoryResponse, error) {
	resp := new(CreateCategoryResponse)

	cat, err := h.Repo.CreateCategory(ctx, repository.CreateCategoryParams{
		Name: req.Body.Name,
	})
	if err != nil {
		return nil, err
	}

	resp.Body = cat
	return resp, nil
}



type CreateSubcategoryRequest struct {
	CategoryID int32 `path:"id"`
	Body       struct {
		Name string `json:"name" minLength:"2" maxLength:"100"`
	}
}

type CreateSubcategoryResponse struct {
	Body repository.Subcategory `json:"subcategory"`
}

func (h *CategoryHandler) CreateSubcategory(ctx context.Context, req *CreateSubcategoryRequest) (*CreateSubcategoryResponse, error) {
	resp := new(CreateSubcategoryResponse)

	sub, err := h.Repo.CreateSubcategory(ctx, repository.CreateSubcategoryParams{
		CategoryID: req.CategoryID,
		Name:       req.Body.Name,
	})
	if err != nil {
		return nil, err
	}

	resp.Body = sub
	return resp, nil
}



type GetTagsRequest struct{}

type GetTagsResponse struct {
	Body struct {
		Tags []repository.Tag `json:"tags"`
	}
}

func (h *CategoryHandler) GetTags(ctx context.Context, req *GetTagsRequest) (*GetTagsResponse, error) {
	resp := new(GetTagsResponse)

	tags, err := h.Repo.GetTags(ctx)
	if err != nil {
		return nil, err
	}

	resp.Body.Tags = tags
	return resp, nil
}



type CreateTagRequest struct {
	Body struct {
		Name string `json:"name" minLength:"2" maxLength:"100"`
	}
}

type CreateTagResponse struct {
	Body repository.Tag `json:"tag"`
}

func (h *CategoryHandler) CreateTag(ctx context.Context, req *CreateTagRequest) (*CreateTagResponse, error) {
	resp := new(CreateTagResponse)

	tag, err := h.Repo.CreateTag(ctx, repository.CreateTagParams{
		Name: req.Body.Name,
	})
	if err != nil {
		return nil, err
	}

	resp.Body = tag
	return resp, nil
}



type GetDepartmentsRequest struct{}

type GetDepartmentsResponse struct {
	Body struct {
		Departments []repository.Department `json:"departments"`
	}
}

func (h *CategoryHandler) GetDepartments(ctx context.Context, req *GetDepartmentsRequest) (*GetDepartmentsResponse, error) {
	resp := new(GetDepartmentsResponse)

	departments, err := h.Repo.GetDepartments(ctx)
	if err != nil {
		return nil, err
	}

	resp.Body.Departments = departments
	return resp, nil
}
